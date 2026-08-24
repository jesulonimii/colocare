export function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
	return (
		<div>
			<p className="mb-1 text-xs font-bold tracking-[0.14em] text-moss uppercase">{eyebrow}</p>
			<h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
			{copy && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{copy}</p>}
		</div>
	)
}
