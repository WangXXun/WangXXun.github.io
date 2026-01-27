export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/resources/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
          fontWeight: 300,
          letterSpacing: '0.2em',
          textTransform: 'lowercase',
          background: 'linear-gradient(90deg, #a8d4f0 0%, #7eb8e8 50%, #5a9fd4 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        xun&apos;s studio
      </h1>
    </main>
  )
}
