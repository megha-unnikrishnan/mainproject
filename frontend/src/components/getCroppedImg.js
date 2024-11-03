const getCroppedImg = async (imageSrc, crop) => {
    const image = document.createElement('img');

    return new Promise((resolve) => {
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;

            const cropX = crop.x * scaleX;
            const cropY = crop.y * scaleY;
            const cropWidth = crop.width * scaleX;
            const cropHeight = crop.height * scaleY;

            canvas.width = cropWidth;
            canvas.height = cropHeight;

            ctx.drawImage(
                image,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight
            );

            canvas.toBlob((blob) => {
                const croppedImageUrl = URL.createObjectURL(blob);
                resolve(croppedImageUrl);
            }, 'image/jpeg');
        };

        image.src = imageSrc;
    });
};

export default getCroppedImg; // Ensure this is a default export
