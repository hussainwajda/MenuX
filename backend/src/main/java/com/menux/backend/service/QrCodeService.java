package com.menux.backend.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.menux.backend.config.AppProperties;
import com.menux.backend.entity.Restaurant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QrCodeService {

    private static final int QR_SIZE = 1024;
    private static final double LOGO_MAX_RATIO = 0.20;

    private final AppProperties appProperties;

    public byte[] generateTableQr(Restaurant restaurant, UUID tableId) {
        String url = buildUrl(restaurant.getSlug(), "table", tableId);
        return generateQrWithLogo(url, restaurant.getLogoUrl());
    }

    public byte[] generateRoomQr(Restaurant restaurant, UUID roomId) {
        String url = buildUrl(restaurant.getSlug(), "room", roomId);
        return generateQrWithLogo(url, restaurant.getLogoUrl());
    }

    private String buildUrl(String slug, String type, UUID id) {
        String base = appProperties.qrBaseUrl() != null ? appProperties.qrBaseUrl().trim() : "";
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        if (base.isBlank()) {
            base = "https://menux-new.vercel.app";
        }
        return base + "/" + slug + "/menu/" + type + "/" + id;
    }

    private byte[] generateQrWithLogo(String qrUrl, String logoUrl) {
        try {
            BitMatrix matrix = new QRCodeWriter().encode(
                    qrUrl,
                    BarcodeFormat.QR_CODE,
                    QR_SIZE,
                    QR_SIZE,
                    qrHints()
            );
            BufferedImage image = toBufferedImage(matrix);
            if (logoUrl != null && !logoUrl.isBlank()) {
                embedLogo(image, logoUrl);
            }
            return toPngBytes(image);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "QR generation failed");
        }
    }

    private Map<EncodeHintType, Object> qrHints() {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.MARGIN, 1);
        return hints;
    }

    private BufferedImage toBufferedImage(BitMatrix matrix) {
        int width = matrix.getWidth();
        int height = matrix.getHeight();
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                image.setRGB(x, y, matrix.get(x, y) ? Color.BLACK.getRGB() : Color.WHITE.getRGB());
            }
        }
        return image;
    }

    private void embedLogo(BufferedImage qrImage, String logoUrl) {
        BufferedImage logoImage = readLogoImage(logoUrl);
        if (logoImage == null) {
            return;
        }

        int maxLogoSize = (int) (QR_SIZE * LOGO_MAX_RATIO);
        int logoWidth = logoImage.getWidth();
        int logoHeight = logoImage.getHeight();
        double scale = Math.min((double) maxLogoSize / logoWidth, (double) maxLogoSize / logoHeight);
        int scaledWidth = Math.max(1, (int) Math.round(logoWidth * scale));
        int scaledHeight = Math.max(1, (int) Math.round(logoHeight * scale));

        Image scaledLogo = logoImage.getScaledInstance(scaledWidth, scaledHeight, Image.SCALE_SMOOTH);

        int padding = Math.max(6, (int) Math.round(Math.max(scaledWidth, scaledHeight) * 0.12));
        int bgWidth = scaledWidth + padding * 2;
        int bgHeight = scaledHeight + padding * 2;
        int x = (QR_SIZE - bgWidth) / 2;
        int y = (QR_SIZE - bgHeight) / 2;

        Graphics2D g = qrImage.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setColor(Color.WHITE);
        g.fillRoundRect(x, y, bgWidth, bgHeight, padding, padding);
        g.drawImage(scaledLogo, x + padding, y + padding, null);
        g.dispose();
    }

    private BufferedImage readLogoImage(String logoUrl) {
        try {
            return ImageIO.read(new URL(logoUrl));
        } catch (IOException ex) {
            return null;
        }
    }

    private byte[] toPngBytes(BufferedImage image) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", outputStream);
        return outputStream.toByteArray();
    }
}
