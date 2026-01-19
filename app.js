/* =========================
   app.js (이메일 + 개인 넘버 조회 / 복사 / 초기화 요청)
   - index.html 요소(id)와 1:1로 맞춘 버전
   ========================= */

// ✅ 데모용 데이터 (실서비스에서는 서버/DB로 대체)
// 형식: { studentNo: "학번", name: "이름", email: "구글계정ID", num: "개인넘버" }
const ACCOUNT_DB = [
  { studentNo: "20123", name: "홍길동", email: "20123@school.edu", num: "111" },
  { studentNo: "20124", name: "김철수", email: "20124@school.edu", num: "222" },
  { studentNo: "30101", name: "이영희", email: "30101@school.edu", num: "333" },
];

const $ = (sel) => document.querySelector(sel);

// ---- DOM ----
const searchForm = $("#searchForm");
const studentNoInput = $("#studentNo");
const studentNameInput = $("#studentName");

const messageEl = $("#message");

const resultCard = $("#resultCard");
const resultEmailEl = $("#resultEmail");
const resultNumEl = $("#resultNum");

const copyEmailBtn = $("#copyEmailBtn");
const copyNumBtn = $("#copyNumBtn");

const resetPwRequestBtn = $("#resetPwRequestBtn");
const resetBtn = $("#resetBtn");

// ---- Utils ----
function normalizeText(s) {
  return String(s ?? "").trim().replace(/\s+/g, " ");
}

function normalizeStudentNo(s) {
  // 숫자 외 제거(하이픈/공백 입력 대비)
  return normalizeText(s).replace(/[^\d]/g, "");
}

function setMessage(text = "", type = "info") {
  // type: info | success | error
  messageEl.textContent = text;
  messageEl.dataset.type = type;
}

function showResult({ email, num }) {
  resultEmailEl.textContent = email || "-";
  resultNumEl.textContent = num || "-";
  resultCard.hidden = false;

  const hasEmail = !!email;
  const hasNum = !!num;

  copyEmailBtn.disabled = !hasEmail;
  copyNumBtn.disabled = !hasNum;

  // 초기화 요청은 '계정 확인'이 되었을 때만 활성화
  resetPwRequestBtn.disabled = !hasEmail;
}

function hideResult() {
  resultCard.hidden = true;
  resultEmailEl.textContent = "-";
  resultNumEl.textContent = "-";

  copyEmailBtn.disabled = true;
  copyNumBtn.disabled = true;
  resetPwRequestBtn.disabled = true;
}

function findAccount(studentNoRaw, nameRaw) {
  const studentNo = normalizeStudentNo(studentNoRaw);
  const name = normalizeText(nameRaw);

  if (!studentNo || !name) return null;

  return (
    ACCOUNT_DB.find(
      (row) =>
        normalizeStudentNo(row.studentNo) === studentNo &&
        normalizeText(row.name) === name
    ) || null
  );
}

// 요청번호 생성(티켓 ID)
function makeTicketId() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PW-${y}${m}${d}-${rand}`;
}

// 클립보드 복사(공통)
async function copyToClipboard(text, successMsg) {
  try {
    await navigator.clipboard.writeText(text);
    setMessage(successMsg, "success");
  } catch {
    setMessage("복사에 실패했어요. 드래그해서 직접 복사해 주세요.", "error");
  }
}

// ---- Events ----

// 검색(엔터/버튼)
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const studentNo = studentNoInput.value;
  const name = studentNameInput.value;

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

  showResult({ email: found.email, num: found.num });
  setMessage("정보를 찾았어요! 필요하면 복사하거나 초기화 요청을 눌러 주세요.", "success");
});

// 이메일 복사
copyEmailBtn.addEventListener("click", async () => {
  const email = resultEmailEl.textContent.trim();
  if (!email || email === "-") return;
  await copyToClipboard(email, "구글 계정(ID)을 클립보드에 복사했어요 ✅");
});

// 개인 넘버 복사
copyNumBtn.addEventListener("click", async () => {
  const num = resultNumEl.textContent.trim();
  if (!num || num === "-") return;
  await copyToClipboard(num, "개인 넘버를 클립보드에 복사했어요 ✅");
});

// 비밀번호 초기화 요청
resetPwRequestBtn.addEventListener("click", () => {
  const email = resultEmailEl.textContent.trim();
  if (!email || email === "-") {
    setMessage("먼저 학번/이름으로 계정(ID)을 조회해 주세요.", "error");
    return;
  }

  const ticketId = makeTicketId();

  // 실제 운영에서는 여기서 서버에 저장/전송해야 함(구글폼/메일/관리자페이지 등)
  // 지금은 '요청번호 발급 + 안내'까지만 구현
  setMessage(
    `비밀번호 초기화 요청이 생성되었습니다 ✅ 요청번호: ${ticketId}\n담임/정보부서(관리자)에게 요청번호와 계정(ID): ${email} 을 전달하세요.`,
    "success"
  );
});

// 지우기(리셋)
resetBtn.addEventListener("click", () => {
  hideResult();
  setMessage("");
  setTimeout(() => studentNoInput.focus(), 0);
});

// 초기 상태
hideResult();
setMessage("");
studentNoInput.focus();
