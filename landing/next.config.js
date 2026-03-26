/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignorar errores de tipo durante la construcción
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignorar errores de lint durante la construcción
    ignoreDuringBuilds: true,
  },
  // Otras configuraciones existentes (si las hay)
  // Ejemplo: output: 'standalone', etc.
};

module.exports = nextConfig;
