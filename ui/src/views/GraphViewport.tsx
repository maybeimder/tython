export default function GraphViewport({ children }: {children: React.ReactNode}) {
      return (
            <div className="relative w-full, h-full overflow-hidden">{ children }</div>
      )
}
