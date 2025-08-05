function updateCurrentTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  document.getElementById("current-time").textContent = `${hh}:${mm}:${ss}`;
}

setInterval(updateCurrentTime, 1000);
updateCurrentTime();

// Save table data in localStorage
function saveEntryToTable(entry) {
  let table = JSON.parse(localStorage.getItem("savedTable") || "[]");
  table.push(entry);
  localStorage.setItem("savedTable", JSON.stringify(table));
}

function clearTableData() {
  if (confirm("Are you sure you want to delete all saved entries?")) {
    localStorage.removeItem("savedTable_1");
    localStorage.removeItem("savedTable_2");
    alert("All entries deleted.");
  }
}

// Highlight toggle logic
function selectNavigator(n) {
  document.getElementById("navigator-select").value = n;

  ["navigator-btn-1", "navigator-btn-2"].forEach((id, idx) => {
    const btn = document.getElementById(id);
    if (btn) {
      const active = idx + 1 === Number(n);
      btn.classList.toggle("bg-blue-500", active);
      btn.classList.toggle("text-white", active);
      btn.classList.toggle("bg-white", !active);
      btn.classList.toggle("text-blue-500", !active);
    }
  });
}

// Modified calculateTime to use navigator toggle and name
function calculateTime() {
  const navigatorNum = document.getElementById("navigator-select").value;
  const userNumber = document.getElementById("user-number").value.trim();
  const userName = document.getElementById("user-name").value.trim();
  const distance = parseFloat(document.getElementById("distance").value);
  const speed = parseFloat(document.getElementById("speed").value) || 2.5;
  let extraTime = 0;
  if (document.getElementById("add-time-checkbox").checked) {
    extraTime = parseInt(document.getElementById("extra-minutes").value) || 0;
  }
  const now = new Date();
  const hoursNeeded = distance / speed;
  const arrivalDate = new Date(
    now.getTime() + hoursNeeded * 60 * 60 * 1000 + extraTime * 60000
  );
  const arrival = `${String(arrivalDate.getHours()).padStart(2, "0")}:${String(
    arrivalDate.getMinutes()
  ).padStart(2, "0")}`;
  const delivering = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
  function getTimeGap(current, arrival) {
    const [ch, cm] = current.split(":").map(Number);
    const [ah, am] = arrival.split(":").map(Number);
    let start = new Date();
    let end = new Date();
    start.setHours(ch, cm, 0, 0);
    end.setHours(ah, am, 0, 0);
    let diff = (end - start) / 60000;
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = Math.round(diff % 60);
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  }
  const timeGap = getTimeGap(delivering, arrival);

  document.getElementById(
    "result"
  ).textContent = `You will arrive at: ${arrival}`;

  // Save to table for selected navigator
  let tableKey = `savedTable_${navigatorNum}`;
  let table = JSON.parse(localStorage.getItem(tableKey) || "[]");
  table.push({
    navigatorNum,
    number: userNumber,
    name: userName,
    distance,
    speed,
    extraTime,
    delivering,
    arrival,
    timeGap,
  });
  localStorage.setItem(tableKey, JSON.stringify(table));

  // Show summary bubble (optional, update as needed)
  document.getElementById(
    "summary-number"
  ).textContent = `חוליה: ${userNumber}`;
  document.getElementById("summary-name").textContent = `שם: ${userName}`;
  document.getElementById(
    "summary-time"
  ).textContent = `ש. שילוח: ${delivering}`;
  document.getElementById(
    "summary-distance"
  ).textContent = `אורך ציר: ${distance} ק״מ`;
  document.getElementById(
    "summary-arrival"
  ).textContent = `זמן משימה: ${arrival}`;
  const bubble = document.getElementById("summary-bubble");
  bubble.classList.remove("hidden");
  bubble.classList.remove("bubble-animate-out");
  bubble.classList.add("bubble-animate-in");
}

// Open saved table in modal
function openTableWindow() {
  const navigatorNum = document.getElementById("navigator-select").value;
  const tableKey = `savedTable_${navigatorNum}`;
  const table = JSON.parse(localStorage.getItem(tableKey) || "[]");
  const tbody = document.getElementById("saved-table-body");
  tbody.innerHTML = "";

  if (table.length) {
    table.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border px-1 py-0.5">${row.number}</td>
        <td class="border px-1 py-0.5">${row.name}</td>
        <td class="border px-1 py-0.5">${row.distance}</td>
        <td class="border px-1 py-0.5">${row.speed}</td>
        <td class="border px-1 py-0.5">${row.extraTime}</td>
        <td class="border px-1 py-0.5">${row.delivering}</td>
        <td class="border px-1 py-0.5">${row.arrival}</td>
        <td class="border px-1 py-0.5">${row.timeGap || ""}</td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="8" class="border px-1 py-0.5 text-center">לא השתלחו חוליות עדיין</td>`;
    tbody.appendChild(tr);
  }

  document.getElementById("saved-table-container").classList.remove("hidden");
}

function closeSavedTable() {
  document.getElementById("saved-table-container").classList.add("hidden");
}

function clearFields() {
  const input = document.getElementById("distance");
  input.value = "4.5"; // Reset to default value
  document.getElementById("result").textContent = "";
}

function adjustDistance(delta) {
  const input = document.getElementById("distance");
  let value = parseFloat(input.value);
  // If the field is empty or not a number, set to 5.0 before applying delta
  if (isNaN(value)) {
    value = 5.0;
  }
  value = Math.max(0, Math.round((value + delta) * 10) / 10); // Keep 1 decimal
  input.value = value.toFixed(1);
}

// Long press logic for plus/minus buttons
function setupLongPress(btnId, delta) {
  const btn = document.getElementById(btnId);
  let timer = null;
  let interval = null;
  let isLongPress = false;

  const start = (e) => {
    e.preventDefault();
    isLongPress = false;
    timer = setTimeout(() => {
      isLongPress = true;
      interval = setInterval(() => adjustDistance(delta), 80);
    }, 400); // 400ms to start long press
  };

  const end = (e) => {
    clearTimeout(timer);
    clearInterval(interval);
    if (!isLongPress) {
      adjustDistance(delta);
    }
  };

  btn.addEventListener("mousedown", start);
  btn.addEventListener("mouseup", end);
  btn.addEventListener("mouseleave", end);

  // Use { passive: false } for touch events so preventDefault works on iOS
  btn.addEventListener("touchstart", start, { passive: false });
  btn.addEventListener("touchend", end);
  btn.addEventListener("touchcancel", end);
}

setupLongPress("minus-btn", -0.1);
setupLongPress("plus-btn", 0.1);

// Prevent double-tap to zoom on buttons
let lastTouchEnd = 0;
document.addEventListener(
  "touchend",
  function (event) {
    if (event.target.tagName === "BUTTON") {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }
  },
  false
);

// Long press to enable editing on distance input
(function setupDistanceLongPress() {
  const input = document.getElementById("distance");
  let timer = null;

  const start = (e) => {
    e.preventDefault();
    timer = setTimeout(() => {
      input.readOnly = false;
      input.focus();
      // Optionally, select all text for easier editing
      input.select();
    }, 400); // 400ms for long press
  };

  const end = () => {
    clearTimeout(timer);
  };

  input.addEventListener("mousedown", start);
  input.addEventListener("mouseup", end);
  input.addEventListener("mouseleave", end);
  input.addEventListener("touchstart", start, { passive: false });
  input.addEventListener("touchend", end);
  input.addEventListener("touchcancel", end);

  // Set back to readonly when input loses focus
  input.addEventListener("blur", () => {
    input.readOnly = true;
  });
})();

// Close bubble on background click or button click
const bubble = document.getElementById("summary-bubble");
document.getElementById("close-summary").addEventListener("click", () => {
  bubble.classList.remove("bubble-animate-in");
  bubble.classList.add("bubble-animate-out");
  setTimeout(() => bubble.classList.add("hidden"), 200);
});
bubble.addEventListener("click", (e) => {
  if (e.target === bubble) {
    bubble.classList.remove("bubble-animate-in");
    bubble.classList.add("bubble-animate-out");
    setTimeout(() => bubble.classList.add("hidden"), 200);
  }
});

// Initial setup
document.getElementById("user-name").value = "";
document.getElementById("user-number").value = "1";

// Load saved tables into navigator buttons
["1", "2"].forEach((n) => {
  const tableKey = `savedTable_${n}`;
  const table = JSON.parse(localStorage.getItem(tableKey) || "[]");
  if (table.length > 0) {
    document.getElementById(`navigator-btn-${n}`).classList.remove("hidden");
  }
});

// Auto-fill distance for new users
document.getElementById("distance").value = "4.5";

// Add default event listeners for navigator buttons
document.querySelectorAll("[id^='navigator-btn-']").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const n = e.target.dataset.navigator;
    selectNavigator(n);
    // openTableWindow();
  });
});

// Select first navigator by default
selectNavigator("1");
