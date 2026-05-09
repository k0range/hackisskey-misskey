import type { Config } from "@/config.js";
import { bindThis } from "@/decorators.js";
import { DI } from "@/di-symbols.js";
import Logger from "@/logger.js";
import { Inject, Injectable } from "@nestjs/common";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import jwt from "jsonwebtoken"
import jwkToPem, { JWK } from "jwk-to-pem";

@Injectable()
export class HcaLinkService {
	private logger: Logger;

	constructor(
		@Inject(DI.config)
		private config: Config
	) {
		
	}

	@bindThis
	public createServer(fastify: FastifyInstance, options: FastifyPluginOptions, done: (err?: Error) => void) {
		fastify.get('/link-hca', async (request, reply) => {
			const scopes = ["openid", "slack_id"]

			const redirectUrl = new URL("https://auth.hackclub.com/oauth/authorize")
			redirectUrl.searchParams.append("client_id", this.config.hcaClientId)
			redirectUrl.searchParams.append("redirect_uri", this.config.url+'/hca-callback')
			redirectUrl.searchParams.append("response_type", "code")
			redirectUrl.searchParams.append("scope", scopes.join(" "))

			reply.redirect(redirectUrl.href)
		})

		fastify.get('/hca-callback', async (request, reply) => {
			const { code } = request.query as { code?: string };
			if (!code) { reply.code(400).send("Code is required") }

			const tokenResponse = await fetch("https://auth.hackclub.com/oauth/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					client_id: this.config.hcaClientId,
					client_secret: this.config.hcaClientSecret,
					code,
					redirect_uri: this.config.url+'/hca-callback',
					grant_type: "authorization_code"
				})
			})
			if (!tokenResponse.ok) {
				reply.code(500).send("Failed to get token from HCA")
				return
			}
			const tokenData = await tokenResponse.json() as {
			  access_token: string,
			  token_type: "Bearer",
			  expires_in: number,
			  refresh_token: string,
			  scope: string;
				created_at: number;
				id_token: string;
			};

			const jwksResponse = await fetch("https://auth.hackclub.com/oauth/discovery/keys")
			jwksResponse.ok || reply.code(500).send("Failed to get JWKS from HCA")
			const jwksData = await jwksResponse.json() as {
				keys: {
					kid: string;
					kty: string;
					use: string;
					n: string;
					e: string;
				}[]
			}
			const signingKey = jwksData.keys.find(key => key.kid === jwt.decode(tokenData.id_token, { complete: true })?.header.kid)
			if (!signingKey) {
				reply.code(500).send("Failed to find signing key for HCA token")
				return
			}

			const oidTokenPayload = jwt.verify(tokenData.id_token, jwkToPem(signingKey as JWK), {
				algorithms: ["RS256"],
				audience: this.config.hcaClientId,
				issuer: "https://auth.hackclub.com"
			}) as {
				sub: string;
				slack_id?: string;
			}

			const token = jwt.sign({
				hca_id: oidTokenPayload.sub,
				slack_id: oidTokenPayload.slack_id,
			}, this.config.jwtSecret, {
				issuer: this.config.url,
				audience: "hca-link",
				expiresIn: "1h"
			})

			reply.header("Content-Type", "text/html").send(`
<!DOCTYPE html>
<html>
<head>
	<title>Hackisskey HCA Link</title>
</head>
<body>
	<script>
		window.opener.postMessage({
			type: "hca-link",
			token: ${JSON.stringify(token)},
			hcaId: ${JSON.stringify(oidTokenPayload.sub)},
			slackId: ${JSON.stringify(oidTokenPayload.slack_id)}
		}, ${JSON.stringify(this.config.url)});
		window.close();
	</script>
</body>
</html>
			`.trim());

		})

		done();
	}
}
