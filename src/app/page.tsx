export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Welcome to Soul Profile Registry
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
          A comprehensive system for managing member soul profiles - capturing values,
          archetypes, interests, participation history, and interaction preferences.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <div className="text-2xl mb-3">🌱</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Soul Profiles
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Track member life stages, archetypes, and core values that guide their journey.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <div className="text-2xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Participation Stats
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Monitor engagement metrics, streaks, and activity patterns across the community.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <div className="text-2xl mb-3">🔗</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Service Integration
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              RESTful API for quest engines, mentor matching, and gamification systems.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <a
            href="/members"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            View Members
          </a>
        </div>
      </div>
    </div>
  )
}
