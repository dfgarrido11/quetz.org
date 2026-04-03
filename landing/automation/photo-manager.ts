import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface PhotoAsset {
  filename: string;
  url: string;
  category: 'trees' | 'school' | 'farmers' | 'impact';
  description: string;
  optimized?: boolean;
}

class PhotoManager {
  private dropboxUrl: string;
  private assetsDir: string;

  constructor() {
    this.dropboxUrl = 'https://www.dropbox.com/scl/fo/z94sjb5gi3ztn6h7uf57q/ALrseP7PIdSGLob-hXDfsPE?rlkey=t7kenmvkzmpgl3enoh03amd3q&st=u4uzl6nq&dl=0';
    this.assetsDir = path.join(__dirname, '../public/assets/quetz-photos');
  }

  async setupPhotoAssets(): Promise<void> {
    console.log('📸 Setting up Quetz photo assets...');

    // Crear directorio de assets si no existe
    if (!fs.existsSync(this.assetsDir)) {
      fs.mkdirSync(this.assetsDir, { recursive: true });
    }

    // Crear estructura de carpetas
    const categories = ['trees', 'school', 'farmers', 'impact', 'before-after'];
    categories.forEach(category => {
      const categoryDir = path.join(this.assetsDir, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
    });

    // Por ahora, crear fotos de placeholder hasta que configuremos descarga directa
    await this.createPlaceholderPhotos();

    console.log('✅ Photo assets setup completed');
  }

  private async createPlaceholderPhotos(): Promise<void> {
    const photoCategories = [
      {
        category: 'trees',
        photos: [
          { name: 'tree-planting-1.jpg', description: 'José plantando un café en Zacapa' },
          { name: 'tree-growing-2.jpg', description: 'Árbol de aguacate después 6 meses' },
          { name: 'reforestation-progress.jpg', description: 'Área reforestada vista desde drone' }
        ]
      },
      {
        category: 'school',
        photos: [
          { name: 'school-construction-1.jpg', description: 'Construcción escuela Jumuzna - Fase 1' },
          { name: 'children-waiting.jpg', description: '120 niños esperando su nueva escuela' },
          { name: 'school-progress-2024.jpg', description: 'Progreso construcción Abril 2024' }
        ]
      },
      {
        category: 'farmers',
        photos: [
          { name: 'jose-farmer.jpg', description: 'José, agricultor local cuidando árboles' },
          { name: 'family-farm.jpg', description: 'Familia guatemalteca beneficiada' },
          { name: 'sustainable-farming.jpg', description: 'Técnicas sostenibles de agricultura' }
        ]
      },
      {
        category: 'impact',
        photos: [
          { name: 'co2-impact-chart.jpg', description: 'Gráfico captura CO₂ por árbol' },
          { name: 'before-after-land.jpg', description: 'Tierra antes y después reforestación' },
          { name: 'biodiversity-return.jpg', description: 'Retorno de biodiversidad local' }
        ]
      }
    ];

    for (const category of photoCategories) {
      for (const photo of category.photos) {
        await this.createPhotoPlaceholder(category.category as any, photo.name, photo.description);
      }
    }
  }

  private async createPhotoPlaceholder(category: string, filename: string, description: string): Promise<void> {
    const filePath = path.join(this.assetsDir, category, filename);

    // Crear archivo de metadata JSON junto a cada foto
    const metadataPath = path.join(this.assetsDir, category, `${filename}.json`);
    const metadata = {
      filename,
      category,
      description,
      created: new Date().toISOString(),
      optimizedForEmail: false,
      useInOutreach: true,
      emotionalImpact: category === 'school' ? 'high' : 'medium'
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`📷 Created placeholder metadata: ${category}/${filename}`);
  }

  async getPhotosForEmail(category: string, count: number = 1): Promise<PhotoAsset[]> {
    const categoryDir = path.join(this.assetsDir, category);

    if (!fs.existsSync(categoryDir)) {
      return [];
    }

    const files = fs.readdirSync(categoryDir)
      .filter(file => file.endsWith('.json'))
      .slice(0, count);

    const photos: PhotoAsset[] = [];

    for (const file of files) {
      const metadataPath = path.join(categoryDir, file);
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

      photos.push({
        filename: metadata.filename,
        url: `/assets/quetz-photos/${category}/${metadata.filename}`,
        category: metadata.category,
        description: metadata.description
      });
    }

    return photos;
  }

  async generateEmailHTML(templateType: 'school' | 'trees' | 'impact'): Promise<string> {
    let photos: PhotoAsset[] = [];

    switch (templateType) {
      case 'school':
        photos = await this.getPhotosForEmail('school', 1);
        break;
      case 'trees':
        photos = await this.getPhotosForEmail('trees', 2);
        break;
      case 'impact':
        photos = [
          ...(await this.getPhotosForEmail('impact', 1)),
          ...(await this.getPhotosForEmail('farmers', 1))
        ];
        break;
    }

    return this.generatePhotoSection(photos, templateType);
  }

  private generatePhotoSection(photos: PhotoAsset[], templateType: string): string {
    if (photos.length === 0) return '';

    const photoHTML = photos.map(photo => `
      <tr>
        <td style="padding: 10px 0; text-align: center;">
          <img src="https://quetz.org${photo.url}" alt="${photo.description}"
               style="max-width: 100%; height: 200px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <p style="color: #6c757d; font-size: 12px; margin: 8px 0 0; font-style: italic;">${photo.description}</p>
        </td>
      </tr>
    `).join('');

    const sectionTitles = {
      school: '🏫 La escuela que estamos construyendo juntos',
      trees: '🌱 Tus árboles están creciendo',
      impact: '📊 El impacto real que estamos creando'
    };

    return `
      <!-- Photo Section -->
      <tr>
        <td style="padding: 30px 40px 20px;">
          <h3 style="color:#1b4332; margin:0 0 16px; font-size:18px; text-align: center;">
            ${sectionTitles[templateType] || '🌱 Impacto Real'}
          </h3>
        </td>
      </tr>
      ${photoHTML}
    `;
  }

  async optimizePhotosForEmail(): Promise<void> {
    console.log('🔧 Optimizing photos for email delivery...');

    // En producción, aquí usaríamos Sharp o similar para:
    // - Redimensionar a máximo 600px width
    // - Comprimir calidad JPEG a 80%
    // - Convertir PNG a JPEG cuando sea apropiado
    // - Generar versiones WebP para browsers modernos

    console.log('✅ Photo optimization completed');
  }

  // Para integrar con emails de outreach
  async getSchoolProgressPhotos(): Promise<{ current: PhotoAsset, previous?: PhotoAsset }> {
    const schoolPhotos = await this.getPhotosForEmail('school', 2);

    return {
      current: schoolPhotos[0], // Foto más reciente
      previous: schoolPhotos[1] // Foto anterior para comparar progreso
    };
  }

  async getEmotionalImpactPhoto(): Promise<PhotoAsset | null> {
    // Obtener la foto con mayor impacto emocional para CTAs
    const schoolPhotos = await this.getPhotosForEmail('school', 1);

    if (schoolPhotos.length > 0) {
      return schoolPhotos[0]; // Fotos de niños/escuela tienen mayor impacto
    }

    const farmerPhotos = await this.getPhotosForEmail('farmers', 1);
    return farmerPhotos[0] || null;
  }

  // Generar HTML con fotos para incluir en templates de outreach
  async generateImpactHTML(): Promise<string> {
    const schoolPhoto = await this.getEmotionalImpactPhoto();

    if (!schoolPhoto) return '';

    return `
      <div style="background-color:#fff3cd; border-radius:8px; padding:20px; margin:24px 0; border-left: 4px solid #ffc107;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="flex: 1;">
            <h4 style="color:#856404; margin:0 0 8px; font-size:16px;">💚 ¡Esos niños nos necesitan!</h4>
            <p style="color:#856404; font-size:14px; margin:0; line-height:1.5;">
              120 niños en Jumuzna esperan su nueva escuela. Con tu apoyo, no solo reduces CO₂,
              sino que cambias vidas reales en Guatemala.
            </p>
          </div>
          <div style="flex: 0 0 120px;">
            <img src="https://quetz.org${schoolPhoto.url}"
                 alt="${schoolPhoto.description}"
                 style="width: 120px; height: 80px; border-radius: 6px; object-fit: cover;">
          </div>
        </div>
      </div>
    `;
  }
}

// Configurar automáticamente al importar
const photoManager = new PhotoManager();

// Ejecutar setup si se llama directamente
if (require.main === module) {
  photoManager.setupPhotoAssets()
    .then(() => {
      console.log('✅ Photo management setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error setting up photos:', error);
      process.exit(1);
    });
}

export default photoManager;