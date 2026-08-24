export function OnboardingProgress({ step, total }: { step: number; total: number }) {
	return (
		<div>
			<div className="flex items-center justify-between text-xs font-bold tracking-wider text-moss uppercase">
				<span>Onboarding</span>
				<span>
					Step {step} of {total}
				</span>
			</div>
			<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sage">
				<div
					className="h-full rounded-full bg-moss transition-all"
					style={{ width: `${(step / total) * 100}%` }}
				/>
			</div>
		</div>
	)
}
