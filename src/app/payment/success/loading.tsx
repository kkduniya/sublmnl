export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-8 text-center">
        <div className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-300">Processing your payment... Please wait.</p>
      </div>
    </div>
  )
}
