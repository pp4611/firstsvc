/* =========================
   app.js (ID 조회용)
   ========================= */

// ✅ 데모용 데이터 (실서비스에서는 서버/DB로 대체)
const ACCOUNT_DB = [
  { studentNo: "20123", name: "홍길동", email: "20123@school.edu" },
  { studentNo: "20124", name: "김철수", email: "20124@school.edu" },
  { studentNo: "30101", name: "이영희", email: "30101@school.edu" },
];

const $ = (sel) => document.querySelector(sel);

const searchForm = $("#searchForm");
const studentNoInput = $("#studentNo");
const studentNameInput = $("#studentName");

const messageEl = $("#message");

const resultCard = $("#resultCard");
const resultEmailEl = $("#resultEmail");
const copyEmailBtn = $("#copyEmailBtn");
const resetBtn = $("#resetBtn");

// 공백/대소문자 차이 등에 대비한 정규화
function normalizeText(s) {
  return String(s ?? "")
    .trim()
    .replace(/\s+/g, " "); // 중복 공백 제거
}

function normalizeStudentNo(s) {
  // 숫자만 남기기 (입력 편의)
  return normalizeText(s).replace(/[^\d]/g, "");
}

function setMessage(text, type = "info") {
  // type: info | success | error
  messageEl.textContent = text || "";
  messageEl.dataset.type = type;
}

function showResult(email) {
  resultEmailEl.textContent = email || "-";
  resultCard.hidden = false;
  copyEmailBtn.disabled = !email;
}

function hideResult() {
  resultCard.hidden = true;
  resultEmailEl.textContent = "-";
  copyEmailBtn.disabled = true;
}

function findAccount(studentNoRaw, nameRaw) {
  const studentNo = normalizeStudentNo(studentNoRaw);
  const name = normalizeText(nameRaw);

  if (!studentNo || !name) return null;

  return ACCOUNT_DB.find((row) => {
    return normalizeStudentNo(row.studentNo) === studentNo &&
           normalizeText(row.name) === name;
  }) || null;
}

// 검색 이벤트 (버튼 클릭 or Enter)
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const studentNo = studentNoInput.value;
  const name = studentNameInput.value;

  // 기본 유효성
  if (!normalizeStudentNo(studentNo) || !normalizeText(name)) {
    hideResult();
    setMessage("학번과 이름을 모두 입력해 주세요.", "error");
    return;
  }

  const found = findAccount(studentNo, name);

  if (!found) {
    hideResult();
    setMessage("일치하는 정보가 없습니다. 학번/이름을 다시 확인해 주세요.", "error");
    return;
  }

  showResult(found.email);
  setMessage("계정(ID)을 찾았어요! 필요하면 복사 버튼을 눌러 주세요.", "success");
});

// 복사 버튼
copyEmailBtn.addEventListener("click", async () => {
  const email = resultEmailEl.textContent.trim();
  if (!email || email === "-") return;

  try {
    await navigator.clipboard.writeText(email);
    setMessage("계정(ID)을 클립보드에 복사했어요 ✅", "success");
  } catch (err) {
    // 일부 환경(HTTP, 권한 문제)에서 실패할 수 있음
    setMessage("복사에 실패했어요. ID를 드래그해서 직접 복사해 주세요.", "error");
  }
});

// 폼 리셋 버튼 처리
resetBtn.addEventListener("click", () => {
  hideResult();
  setMessage("");
  // 리셋 후 포커스
  setTimeout(() => studentNoInput.focus(), 0);
});

// 처음 로드 시 UI 초기화
