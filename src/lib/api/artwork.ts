// API functions for artwork submission
export interface ArtworkSubmissionResponse {
  success: boolean;
  message: string;
  artworkId?: string;
}

export const submitArtwork = async (
  formData: FormData
): Promise<ArtworkSubmissionResponse> => {
  try {
    const response = await fetch("/api/artworks/submit", {
      method: "POST",
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting artwork:", error);
    throw error;
  }
};

// Example backend endpoint handler (Node.js/Express)
export const exampleBackendHandler = `
// Example backend endpoint for handling FormData
app.post('/api/artworks/submit', upload.fields([
  { name: 'proofOfOrigin', maxCount: 1 },
  { name: 'photo_0', maxCount: 1 },
  { name: 'photo_1', maxCount: 1 },
  { name: 'photo_2', maxCount: 1 },
  { name: 'photo_3', maxCount: 1 },
  { name: 'photo_4', maxCount: 1 }
]), (req, res) => {
  try {
    const {
      typeOfArtwork,
      technique,
      artist,
      support,
      titleOfArtwork,
      state,
      yearOfArtwork,
      dimensions,
      isFramed,
      weight,
      handDeliveryAccepted,
      origin,
      yearOfAcquisition,
      description,
      desiredPrice,
      acceptPriceNegotiation,
      accountHolder,
      iban,
      bicCode,
      acceptTermsOfSale,
      giveSalesMandate
    } = req.body

    const files = req.files
    const proofOfOrigin = files.proofOfOrigin?.[0]
    const photos = Object.keys(files)
      .filter(key => key.startsWith('photo_'))
      .map(key => files[key][0])
      .filter(Boolean)

    // Parse dimensions JSON
    const artworkDimensions = JSON.parse(dimensions)

    // Process the artwork data
    const artworkData = {
      typeOfArtwork,
      technique,
      artist,
      support,
      titleOfArtwork,
      state,
      yearOfArtwork,
      dimensions: artworkDimensions,
      isFramed,
      weight,
      handDeliveryAccepted,
      origin,
      yearOfAcquisition,
      description,
      desiredPrice: parseFloat(desiredPrice),
      acceptPriceNegotiation: acceptPriceNegotiation === 'true',
      accountHolder,
      iban,
      bicCode,
      acceptTermsOfSale: acceptTermsOfSale === 'true',
      giveSalesMandate: giveSalesMandate === 'true',
      proofOfOrigin: proofOfOrigin?.filename,
      photos: photos.map(photo => photo.filename)
    }

    // Save to database, process files, etc.
    console.log('Received artwork data:', artworkData)

    res.json({
      success: true,
      message: 'Artwork submitted successfully',
      artworkId: 'generated-id-here'
    })
  } catch (error) {
    console.error('Error processing artwork submission:', error)
    res.status(500).json({
      success: false,
      message: 'Error processing submission'
    })
  }
})
`;
