function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// FIX: Helper function to write a string to a DataView.
function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}

// Converts raw PCM audio data (base64) into a WAV file data URL.
export function pcmToWavDataUrl(pcmBase64: string): string {
    const pcmData = decode(pcmBase64);
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcmData.length;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF header
    // FIX: Replaced non-standard view.setString with a local helper function.
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    // FIX: Replaced non-standard view.setString with a local helper function.
    writeString(view, 8, 'WAVE');

    // fmt chunk
    // FIX: Replaced non-standard view.setString with a local helper function.
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Sub-chunk size (16 for PCM)
    view.setUint16(20, 1, true); // Audio format (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data chunk
    // FIX: Replaced non-standard view.setString with a local helper function.
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Write PCM data
    const pcmAsUint8 = new Uint8Array(pcmData);
    new Uint8Array(buffer, 44).set(pcmAsUint8);

    const wavBlob = new Blob([view], { type: 'audio/wav' });
    const finalWavData = new Uint8Array(buffer);
    const wavBase64 = encode(finalWavData);
    
    return `data:audio/wav;base64,${wavBase64}`;
}


// FIX: Removed non-standard modification of DataView.prototype.
