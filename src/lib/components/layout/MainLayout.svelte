<div
	class="bg-base-200
    grid grid-cols-[1fr_minmax(0,min-content)]
     grid-rows-[minmax(0,min-content)_minmax(1fr,1fr)_minmax(0,min-content)]
     h-full "
>
	<div class="row-start-1 col-start-1"><slot name="head" /></div>
	<!-- TODO maybe handle the display part here, and make sure the sidebar is similar sized in all Pages -->
	<div class="row-start-1 col-start-2 row-span-2 min-h-0 "><slot name="side" /></div>
	<!-- Main is supposed to handle the full layout, need to add sublayout and overflow as
         needed to ensure not to overflow the space-->
	<div class="col-start-1 row-start-2 relative min-h-0 min-w-0">
		<slot name="main" />
	</div>
	<div class="col-start-1 col-span-2 row-start-3 min-h-0 min-w-0"><slot name="footer" /></div>
</div>
