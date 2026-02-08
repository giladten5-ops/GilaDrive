import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

const DEFAULT_MAX_BYTES = 6 * 1024 * 1024;
const IMAGE_MIME_BY_EXT = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

function getExt(name) {
  const raw = String(name || "").trim();
  const parts = raw.split(".");
  if (parts.length < 2) return "";
  return parts.pop().toLowerCase();
}

function guessMimeFromName(name) {
  const ext = getExt(name);
  return IMAGE_MIME_BY_EXT[ext] || "";
}

function buildDataUrl(mime, base64) {
  return `data:${mime};base64,${base64}`;
}

function estimateBytesFromBase64(base64) {
  if (!base64) return 0;
  return Math.floor((base64.length * 3) / 4);
}

export async function pickImage({ fromCamera = false, maxBytes = DEFAULT_MAX_BYTES } = {}) {
  const permission = fromCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Permission denied to access photos/camera.");
  }

  const result = fromCamera
    ? await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.8,
      })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.8,
      });

  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset) return null;

  const name = asset.fileName || asset.uri?.split("/").pop() || "image.jpg";
  const mimeType = asset.mimeType || guessMimeFromName(name) || "image/jpeg";

  let base64 = asset.base64;
  if (!base64) {
    base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType?.Base64 ?? "base64",
    });
  }

  const size = asset.fileSize || estimateBytesFromBase64(base64);
  if (maxBytes && size && size > maxBytes) {
    throw new Error("Image is too large. Please pick a smaller file.");
  }

  return {
    name,
    mimeType,
    size,
    dataUrl: buildDataUrl(mimeType, base64),
  };
}

export async function pickDocument({ maxBytes = DEFAULT_MAX_BYTES } = {}) {
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    multiple: false,
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset) return null;

  const name = asset.name || "upload";
  const mimeType = asset.mimeType || guessMimeFromName(name) || "application/octet-stream";
  const size = asset.size || 0;

  if (maxBytes && size && size > maxBytes) {
    throw new Error("File is too large. Please pick a smaller file.");
  }

  const isImage = mimeType.startsWith("image/");
  let content = "";

  if (isImage) {
    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType?.Base64 ?? "base64",
    });
    content = buildDataUrl(mimeType, base64);
  } else {
    try {
      content = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType?.UTF8 ?? "utf8",
      });
    } catch (err) {
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType?.Base64 ?? "base64",
      });
      content = buildDataUrl(mimeType, base64);
    }
  }

  return { name, mimeType, size, content };
}
