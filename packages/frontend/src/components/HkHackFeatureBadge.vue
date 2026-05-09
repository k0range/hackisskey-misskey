<template>
	<span v-tooltip="'Hackisskey'" :class="$style.badge">Hackisskey</span>
</template>

<style lang="scss" module>
.badge {
	margin-left: 0.7em;
	font-size: 80%;
	padding: 2px 3px;
	color: var(--MI_THEME-accent);
	border: solid 1px var(--MI_THEME-accent);
	border-radius: 4px;
	vertical-align: middle;
}
</style>
