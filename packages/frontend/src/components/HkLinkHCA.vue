<template>
	<div>
		<label :class="$style.label">Hack Club Account<HkHackFeatureBadge/></label>
		<div :class="$style.caption">
			To verify that you are a Hack Club member, you must link your Hack Club Account during sign-up. Regardless of your Hack Club Account, you can create as many accounts as you like.
		</div>
		<div v-if="linkedHcaUserInfo" :class="$style.hcaCard">
			<svg v-if="!linkedHcaUserInfo.finished" :class="$style.spinner" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-loader-2">
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<path d="M12 3a9 9 0 1 0 9 9" />
			</svg>
			<template v-else-if="!linkedHcaUserInfo.name">
				<i class="ti ti-check" :class="$style.successCheck"></i>
				<div :class="$style.body">
					<span :class="$style.name">Linked to Hack Club Account</span>
					<span :class="$style.sub"><slot name="sub"><span class="_monospace">{{ linkedHcaUserInfo.slackId }}</span></slot></span>
				</div>
				<button class="_button" :class="$style.remove" @click="reset"><i class="ti ti-x"></i></button>
			</template>
			<template v-else>
				<img :class="$style.avatar" :src="linkedHcaUserInfo.avatar" />
				<div :class="$style.body">
					<span :class="$style.name">{{ linkedHcaUserInfo.name }}</span>
					<span :class="$style.sub"><slot name="sub"><span class="_monospace">{{ linkedHcaUserInfo.slackId }}</span></slot></span>
				</div>
				<button class="_button" :class="$style.remove" @click="reset"><i class="ti ti-x"></i></button>
			</template>
		</div>
		<MkButton v-else
			transparent
			@click="linkHCA"
			:class="$style.linkButton"
		>
			<div :class="$style.linkButtonInner">
				<span><i class="ti ti-link"></i></span>
				<span>Link Account</span>
			</div>
		</MkButton>
	</div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue';
import HkHackFeatureBadge from './HkHackFeatureBadge.vue';
import MkButton from './MkButton.vue';

const linkedHcaUserInfo = ref<{
	hcaToken: string;
	finished: boolean;
	avatar?: string;
	name?: string;
	slackId?: string;
} | null>(null)

const emit = defineEmits(['update:hcaToken']);

function reset() {
	linkedHcaUserInfo.value = null;
	emit('update:hcaToken', null);
}

async function onMessageListener(event: MessageEvent<any>) {
	if (event.origin !== window.location.origin) return;

	if (!('type' in event.data && event.data.type === "hca-link")) return;

	linkedHcaUserInfo.value = {
		hcaToken: event.data.token,
		slackId: event.data.slackId,
		finished: false
	}
	emit('update:hcaToken', event.data.token);

  fetch("https://cachet.dunkirk.sh/users/"+event.data.slackId)
		.then(res => {
			if (!res.ok) {
				throw new Error("Failed to fetch user info from cachet");
			}

			return res.json();
		})
		.then(data => {
			linkedHcaUserInfo.value!.avatar = data.imageUrl;
			linkedHcaUserInfo.value!.name = data.displayName;
			linkedHcaUserInfo.value!.finished = true;
		})
		.catch(err => {
			console.error("Failed to fetch user info from cachet", err);
			linkedHcaUserInfo.value!.finished = true;
		})
}

function linkHCA() {
	window.addEventListener("message", onMessageListener)
	
	if (window.open) {
		const width = 600;
  	const height = 700;
  	const left = (screen.width / 2) - (width / 2);
  	const top = (screen.height / 2) - (height / 2);

		window.open("/link-hca", undefined, `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`)
	} else {
		const a = document.createElement('a');
    a.href = "/link-hca";
    a.target = '_blank';
    a.click();
	}
}

onBeforeUnmount(() => {
	window.removeEventListener("message", onMessageListener)
})
</script>

<style lang="scss" module>
$bodyTitleHieght: 18px;
$bodyInfoHieght: 16px;

.label {
	font-size: 0.85em;
	padding: 0 0 8px 0;
	user-select: none;

	&:empty {
		display: none;
	}
}

.caption {
	font-size: 0.85em;
	padding: 8px 0 8px 0;
	color: color(from var(--MI_THEME-fg) srgb r g b / 0.75);

	&:empty {
		display: none;
	}
}

.linkButton {
	width: 100%;
	height: 100%;
	padding: 12px;
	border: 2px dashed color(from var(--MI_THEME-fg) srgb r g b / 0.5);
}

.linkButtonInner {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
	min-height: 38px;
}

.hcaCard {
	background: var(--MI_THEME-panel);
	border-radius: 6px;
	display: flex;
	align-items: center;
	padding: 16px;
}

.spinner {
	margin: 0 auto;
	color: var(--MI_THEME-accent);
	animation: spin 1s linear infinite
}
@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.successCheck {
	color: var(--MI_THEME-success);
	font-size: 24px;
	margin-right: 12px;
}

.avatar {
	display: block;
	width: ($bodyTitleHieght + $bodyInfoHieght);
	height: ($bodyTitleHieght + $bodyInfoHieght);
	margin-right: 12px;
	border-radius: 6px;
}

.body {
	flex-grow: 1;
}

.name {
	display: block;
	width: 100%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: $bodyTitleHieght;
}

.sub {
	display: block;
	width: 100%;
	font-size: 95%;
	opacity: 0.7;
	line-height: $bodyInfoHieght;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.remove {
	/* color: var(--MI_THEME-error) */
}
</style>
