<div class="layoutContainer bg-base-200 h-full">
	<div class="LCTop"><slot name="head" /></div>
	<!-- TODO maybe handle the display part here, and make sure the sidebar is similar sized in all Pages -->
	<div class="LCSide min-h-0 ">
		<slot name="side" />
	</div>
	<!-- Main is supposed to handle the full layout, need to add sublayout and overflow as
         needed to ensure not to overflow the space-->
	<div class="LCMain relative min-h-0 min-w-0 ">
		<slot name="main" />
	</div>
	<div class="LCFooter ">
		<slot name="footer" />
	</div>
</div>

<style>
	.layoutContainer {
		display: grid;
		grid-template-columns: 1fr min-content;
		grid-template-rows: min-content 1fr minmax(0, min-content);
		gap: 0px 0px;
		grid-auto-flow: row;
		grid-template-areas:
			'Top Side'
			'Main Side'
			'footer footer';
	}

	.LCMain {
		grid-area: Main;
	}

	.LCFooter {
		grid-area: footer;
	}

	.LCSide {
		grid-area: Side;
	}

	.LCTop {
		grid-area: Top;
	}
</style>
