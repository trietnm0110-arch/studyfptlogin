import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { firebaseApp } from './firebase';

interface WeeklyStudyInput {
  weekNumber: number;
  rating: number;
  totalHours: number;
  budgetHours: number;
  mostTimeConsumingSubject: string;
  obstacle: string;
  subjects: {
    code: string;
    name: string;
    spentHours: number;
    budgetHours: number;
  }[];
}

const model = firebaseApp
  ? getGenerativeModel(getAI(firebaseApp, { backend: new GoogleAIBackend() }), {
      model: 'gemini-3.8-flash',
      generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
    })
  : undefined;

export const generateWeeklyStudyAdvice = async (input: WeeklyStudyInput): Promise<string> => {
  if (!model) {
    throw new Error('Firebase chưa được cấu hình.');
  }

  const prompt = `Bạn là trợ lý học tập cho sinh viên đại học. Hãy phân tích dữ liệu tuần ${input.weekNumber} và trả lời bằng tiếng Việt, ngắn gọn, thực tế, không phán xét.

Điểm tự đánh giá: ${input.rating}/5
Giờ đã học: ${input.totalHours}h / ${input.budgetHours}h mục tiêu
Môn tốn thời gian nhưng chưa hiệu quả: ${input.mostTimeConsumingSubject || 'Chưa ghi'}
Rào cản: ${input.obstacle || 'Chưa ghi'}
Chi tiết theo môn: ${input.subjects.map((subject) => `${subject.code} (${subject.name}): ${subject.spentHours}h/${subject.budgetHours}h`).join('; ')}

Đưa ra đúng 3 phần có tiêu đề: Nhìn lại, Ưu tiên tuần tới, Kế hoạch cụ thể. Kế hoạch cụ thể gồm tối đa 3 hành động có thể làm được và phù hợp với thời gian đã học. Không bịa điểm số hoặc kết quả học tập.`;

  const result = await model.generateContent(prompt);
  const advice = result.response.text().trim();
  if (!advice) {
    throw new Error('AI không trả về nội dung.');
  }
  return advice;
};