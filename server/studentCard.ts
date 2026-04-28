import { createCanvas, registerFont } from "canvas";
import { storagePut } from "./storage";

/**
 * 명원고 디지털 학생증 생성 및 합성
 * 플레이어 사진과 학생증 템플릿을 합성하여 개인화된 학생증 이미지 생성
 */

const CARD_WIDTH = 600;
const CARD_HEIGHT = 400;
const SCHOOL_NAME = "명원고등학교";
const CLASS_NAME = "2학년 2반";
const SLOGAN = "Myeonwon's Truth, Endless Reset";

interface StudentCardOptions {
  playerName: string;
  studentId: string;
  photoUrl: string;
  traumaLevel?: number;
  loopCount?: number;
}

/**
 * 학생증 이미지 생성 및 S3 업로드
 */
export async function generateStudentCard(options: StudentCardOptions) {
  const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT);
  const ctx = canvas.getContext("2d");

  // 배경 색상 (명원고 다크 블루)
  ctx.fillStyle = "#0F2E5C";
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // 상단 배너 (골드)
  ctx.fillStyle = "#D4AF37";
  ctx.fillRect(0, 0, CARD_WIDTH, 60);

  // 학교명 및 슬로건 (상단)
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(SCHOOL_NAME, CARD_WIDTH / 2, 35);

  ctx.font = "12px Arial";
  ctx.fillStyle = "#D4AF37";
  ctx.fillText(SLOGAN, CARD_WIDTH / 2, CARD_HEIGHT - 20);

  // 학급 정보
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`학급: ${CLASS_NAME}`, 40, 120);
  ctx.fillText(`학번: ${options.studentId}`, 40, 150);
  ctx.fillText(`이름: ${options.playerName}`, 40, 180);

  // 프로필 사진 영역 (우측)
  const photoX = 380;
  const photoY = 100;
  const photoSize = 200;

  // 사진 테두리 (골드)
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 3;
  ctx.strokeRect(photoX, photoY, photoSize, photoSize);

  // 사진 로드 및 그리기
  try {
    const { Image } = await import("canvas");
    const img = new Image();
    img.src = options.photoUrl;
    ctx.drawImage(img, photoX + 3, photoY + 3, photoSize - 6, photoSize - 6);
  } catch (error) {
    // 사진 로드 실패 시 플레이스홀더
    ctx.fillStyle = "#666666";
    ctx.fillRect(photoX + 3, photoY + 3, photoSize - 6, photoSize - 6);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("사진", photoX + photoSize / 2, photoY + photoSize / 2);
  }

  // 트라우마 수치 표시 (옵션)
  if (options.traumaLevel !== undefined) {
    ctx.fillStyle = "#FF6B6B";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`트라우마: ${options.traumaLevel}/100`, 40, 210);
  }

  // 루프 회차 표시 (옵션)
  if (options.loopCount !== undefined) {
    ctx.fillStyle = "#FFD700";
    ctx.font = "12px Arial";
    ctx.fillText(`루프: ${options.loopCount}`, 40, 240);
  }

  // Canvas를 Buffer로 변환
  const buffer = canvas.toBuffer("image/png");

  // S3에 업로드
  const fileName = `student-cards/${options.studentId}-${Date.now()}.png`;
  const { url, key } = await storagePut(fileName, buffer, "image/png");

  return { url, key };
}

/**
 * 학생증 왜곡 효과 적용 (트라우마/루프 연동)
 * 이미지에 노이즈, 색상 변조, 잔상 등의 효과를 적용하여 재생성
 */
export async function applyDistortionToStudentCard(
  originalImageUrl: string,
  traumaLevel: number,
  loopCount: number
): Promise<string> {
  const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT);
  const ctx = canvas.getContext("2d");

  // 원본 이미지 로드
  try {
    const { Image } = await import("canvas");
    const img = new Image();
    img.src = originalImageUrl;
    ctx.drawImage(img, 0, 0, CARD_WIDTH, CARD_HEIGHT);
  } catch (error) {
    console.error("Failed to load original image:", error);
    return originalImageUrl;
  }

  // 왜곡 강도 계산 (트라우마 + 루프)
  const distortionStrength = Math.min(
    100,
    (traumaLevel * 0.5 + loopCount * 5) / 100
  );

  // 1. 노이즈 효과 적용
  if (distortionStrength > 0.1) {
    const imageData = ctx.getImageData(0, 0, CARD_WIDTH, CARD_HEIGHT);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * distortionStrength * 50;
      data[i] += noise; // R
      data[i + 1] += noise; // G
      data[i + 2] += noise; // B
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // 2. 색상 변조 효과 (트라우마가 높을수록 빨강/초록 혼합)
  if (distortionStrength > 0.2) {
    ctx.globalAlpha = distortionStrength * 0.3;
    ctx.fillStyle = `rgba(255, 0, 0, ${distortionStrength * 0.2})`;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    ctx.globalAlpha = 1;
  }

  // 3. 잔상 효과 (루프가 높을수록 강함)
  if (loopCount > 0) {
    ctx.globalAlpha = 0.1 * (loopCount / 10);
    ctx.drawImage(canvas, 2, 2);
    ctx.globalAlpha = 1;
  }

  // 4. 화면 흔들림 효과 (극도의 트라우마)
  if (traumaLevel > 75) {
    const shakeAmount = (traumaLevel - 75) / 25 * 5;
    ctx.translate(
      (Math.random() - 0.5) * shakeAmount,
      (Math.random() - 0.5) * shakeAmount
    );
  }

  // 왜곡된 이미지 Buffer로 변환
  const buffer = canvas.toBuffer("image/png");

  // S3에 업로드
  const fileName = `student-cards/distorted-${Date.now()}.png`;
  const { url } = await storagePut(fileName, buffer, "image/png");

  return url;
}

/**
 * 학생증 이미지에 글리치 텍스트 오버레이 (극도의 붕괴 상태)
 */
export async function addGlitchTextToCard(
  baseImageUrl: string,
  glitchText: string,
  traumaLevel: number
): Promise<string> {
  const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT);
  const ctx = canvas.getContext("2d");

  // 배경 이미지 로드
  try {
    const { Image } = await import("canvas");
    const img = new Image();
    img.src = baseImageUrl;
    ctx.drawImage(img, 0, 0, CARD_WIDTH, CARD_HEIGHT);
  } catch (error) {
    return baseImageUrl;
  }

  // 글리치 텍스트 렌더링 (트라우마 수치에 따라 위치 변동)
  if (traumaLevel > 80) {
    ctx.font = "bold 32px Arial";
    ctx.fillStyle = `rgba(255, 0, 0, ${(traumaLevel - 80) / 20 * 0.7})`;

    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      ctx.fillText(glitchText, 50 + offsetX, 320 + offsetY + i * 40);
    }
  }

  const buffer = canvas.toBuffer("image/png");
  const fileName = `student-cards/glitch-${Date.now()}.png`;
  const { url } = await storagePut(fileName, buffer, "image/png");

  return url;
}
