// src/components/CurriculumPlan/CurriculumPlanPage.js

import React, { useEffect, useRef } from "react";
import * as XLSX from "xlsx";

import {
  db,
  doc,
  getDoc,
  setDoc
} from "../../firebase";

import "./CurriculumPlanPage.css";

const translations = {
  ru: {
    pageTitle: "Нагрузка",
    direction: "Направление:",
    academicYear: "Учебный год:",
    addYear: "Добавить год",
    studyForm: "Форма обучения:",
    qualification: "Квалификация:",
    bachelor: "Бакалавр",
    fullTime: "Очная",
    partTime: "Заочная",
    edit: "Изменить",
    save: "Сохранить",
    addBlock: "Добавить блок",
    exportExcel: "Экспорт Excel",
    statusReady: "Таблица готова. Для заполнения нажмите кнопку “Изменить”.",
    viewMode: "Режим просмотра",
    editMode: "Режим редактирования",

    disciplines: "Дисциплины",
    totalLoad: "Общая нагрузка",
    auditorium: "Аудиторные занятия",
    creditsShort: "Кред.",
    hours: "Часы",
    lectureShort: "Лекц.",
    practiceShort: "Практ.",
    labShort: "Лаб.",

    semester1: "1 семестр",
    semester2: "2 семестр",
    semester3: "3 семестр",
    semester4: "4 семестр",
    semester5: "5 семестр",
    semester6: "6 семестр",
    semester7: "7 семестр",
    semester8: "8 семестр",

    blockPlaceholder: "Введите название блока.",
    disciplinePlaceholder: "Дисциплина.",
    totalBlock: "Итого по блоку",
    grandTotal: "ИТОГО:",
    addDisciplineTitle: "Добавить дисциплину в этот блок",
    deleteBlockTitle: "Удалить блок",

    loadYearsError: "Ошибка загрузки учебных годов из базы.",
    promptYear: "Введите новый учебный год. Например: 2027-2028",
    newYearAdded: "Новый учебный год добавлен. Открыта пустая таблица для заполнения.",
    addYearError: "Ошибка добавления учебного года в базу.",
    saved: "Учебный план сохранён в Firebase. Таблица переведена в режим просмотра.",
    saveError: "Ошибка сохранения учебного плана в Firebase.",
    noDataTeacher: "Для выбранного года учебный план ещё не добавлен.",
    noDataAdmin: "Для выбранного года данных нет. Открыта пустая таблица.",
    loaded: "Учебный план загружен из Firebase.",
    loadError: "Ошибка загрузки учебного плана из Firebase.",
    disciplineAdded: "Дисциплина добавлена.",
    blockAdded: "Новый блок добавлен.",
    confirmDeleteBlock: "Удалить этот блок вместе с дисциплинами?",
    blockDeleted: "Блок удалён.",
    editEnabled: "Режим редактирования включён. Теперь можно изменять ячейки.",
    exported: "Учебный план экспортирован в Excel.",
    sheetName: "Нагрузка",
    fileName: "Нагрузка"
  },

  kg: {
    pageTitle: "Окуу планы",
    direction: "Багыт:",
    academicYear: "Окуу жылы:",
    addYear: "Жыл кошуу",
    studyForm: "Окуу формасы:",
    qualification: "Квалификация:",
    bachelor: "Бакалавр",
    fullTime: "Күндүзгү",
    partTime: "Сырттан",
    edit: "Өзгөртүү",
    save: "Сактоо",
    addBlock: "Блок кошуу",
    exportExcel: "Excel экспорт",
    statusReady: "Таблица даяр. Толтуруу үчүн “Өзгөртүү” баскычын басыңыз.",
    viewMode: "Көрүү режими",
    editMode: "Редактирлөө режими",

    disciplines: "Дисциплиналар",
    totalLoad: "Жалпы жүктөм",
    auditorium: "Аудиториялык сабактар",
    creditsShort: "Кред.",
    hours: "Саат",
    lectureShort: "Лекц.",
    practiceShort: "Практ.",
    labShort: "Лаб.",

    semester1: "1 семестр",
    semester2: "2 семестр",
    semester3: "3 семестр",
    semester4: "4 семестр",
    semester5: "5 семестр",
    semester6: "6 семестр",
    semester7: "7 семестр",
    semester8: "8 семестр",

    blockPlaceholder: "Блоктун атын жазыңыз.",
    disciplinePlaceholder: "Дисциплина.",
    totalBlock: "Блок боюнча жыйынтык",
    grandTotal: "ЖАЛПЫ:",
    addDisciplineTitle: "Бул блокко дисциплина кошуу",
    deleteBlockTitle: "Блокту өчүрүү",

    loadYearsError: "Окуу жылдарын базадан жүктөөдө ката кетти.",
    promptYear: "Жаңы окуу жылын жазыңыз. Мисалы: 2027-2028",
    newYearAdded: "Жаңы окуу жылы кошулду. Толтуруу үчүн бош таблица ачылды.",
    addYearError: "Окуу жылын базага кошууда ката кетти.",
    saved: "Окуу планы Firebase базасына сакталды. Таблица көрүү режимине өттү.",
    saveError: "Окуу планын Firebase базасына сактоодо ката кетти.",
    noDataTeacher: "Тандалган жыл үчүн окуу планы азырынча кошула элек.",
    noDataAdmin: "Тандалган жыл үчүн маалымат жок. Бош таблица ачылды.",
    loaded: "Окуу планы Firebase базасынан жүктөлдү.",
    loadError: "Окуу планын Firebase базасынан жүктөөдө ката кетти.",
    disciplineAdded: "Дисциплина кошулду.",
    blockAdded: "Жаңы блок кошулду.",
    confirmDeleteBlock: "Бул блокту дисциплиналары менен кошо өчүрөсүзбү?",
    blockDeleted: "Блок өчүрүлдү.",
    editEnabled: "Редактирлөө режими күйдү. Эми ячейкаларды өзгөртүүгө болот.",
    exported: "Окуу планы Excel файлына экспорттолду.",
    sheetName: "Нагрузка",
    fileName: "Нагрузка"
  },

  en: {
    pageTitle: "Curriculum plan",
    direction: "Direction:",
    academicYear: "Academic year:",
    addYear: "Add year",
    studyForm: "Study form:",
    qualification: "Qualification:",
    bachelor: "Bachelor",
    fullTime: "Full-time",
    partTime: "Part-time",
    edit: "Edit",
    save: "Save",
    addBlock: "Add block",
    exportExcel: "Export Excel",
    statusReady: "The table is ready. Click “Edit” to fill it in.",
    viewMode: "View mode",
    editMode: "Edit mode",

    disciplines: "Disciplines",
    totalLoad: "Total workload",
    auditorium: "Classroom lessons",
    creditsShort: "Cred.",
    hours: "Hours",
    lectureShort: "Lect.",
    practiceShort: "Pract.",
    labShort: "Lab.",

    semester1: "Semester 1",
    semester2: "Semester 2",
    semester3: "Semester 3",
    semester4: "Semester 4",
    semester5: "Semester 5",
    semester6: "Semester 6",
    semester7: "Semester 7",
    semester8: "Semester 8",

    blockPlaceholder: "Enter block name.",
    disciplinePlaceholder: "Discipline.",
    totalBlock: "Total for block",
    grandTotal: "TOTAL:",
    addDisciplineTitle: "Add discipline to this block",
    deleteBlockTitle: "Delete block",

    loadYearsError: "Error loading academic years from database.",
    promptYear: "Enter new academic year. Example: 2027-2028",
    newYearAdded: "New academic year added. An empty table is opened for filling.",
    addYearError: "Error adding academic year to database.",
    saved: "Curriculum plan saved to Firebase. The table is switched to view mode.",
    saveError: "Error saving curriculum plan to Firebase.",
    noDataTeacher: "The curriculum plan for the selected year has not been added yet.",
    noDataAdmin: "No data for the selected year. An empty table is opened.",
    loaded: "Curriculum plan loaded from Firebase.",
    loadError: "Error loading curriculum plan from Firebase.",
    disciplineAdded: "Discipline added.",
    blockAdded: "New block added.",
    confirmDeleteBlock: "Delete this block together with its disciplines?",
    blockDeleted: "Block deleted.",
    editEnabled: "Edit mode enabled. Now you can change cells.",
    exported: "Curriculum plan exported to Excel.",
    sheetName: "Curriculum plan",
    fileName: "Curriculum_plan"
  }
};

const DEFAULT_YEARS = ["2024-2025", "2025-2026", "2026-2027"];

function makeSafeDocId(value = "") {
  return String(value || "")
    .trim()
    .replaceAll("/", "-")
    .replaceAll("\\", "-")
    .replace(/\s+/g, "_");
}

function makePlanDocId(direction, year, form) {
  return [
    makeSafeDocId(direction),
    makeSafeDocId(year),
    makeSafeDocId(form)
  ].join("__");
}

export default function CurriculumPlanPage({
  mode = "admin",
  role = mode,
  language = "ru",
  t: parentT = {},
  readOnly = false,
  readonly = false
}) {
  const rootRef = useRef(null);

  const normalizedMode = String(mode || "").trim().toLowerCase();
  const normalizedRole = String(role || mode || "").trim().toLowerCase();

  const isTeacher =
    normalizedMode === "teacher" ||
    normalizedRole === "teacher" ||
    normalizedRole === "преподаватель";

  const isLab =
    normalizedMode === "lab" ||
    normalizedMode === "laborant" ||
    normalizedRole === "lab" ||
    normalizedRole === "laborant" ||
    normalizedRole === "лаборант";

  const isReadOnly = Boolean(readOnly || readonly);

  const text = {
    ...(translations[language] || translations.ru),
    ...parentT
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const SEMESTERS = [
      text.semester1,
      text.semester2,
      text.semester3,
      text.semester4,
      text.semester5,
      text.semester6,
      text.semester7,
      text.semester8
    ];

    let isEditMode = !isReadOnly;
    let rows = [];
    let years = [];

    function $(id) {
      return root.querySelector(`#${id}`);
    }

    function emptySemesters() {
      return Array.from({ length: 8 }, () => ({
        lecture: "",
        practice: "",
        lab: "",
        credit: ""
      }));
    }

    function makeRow(type = "discipline", name = "", blockNo = null) {
      return {
        type,
        blockNo,
        name,
        credits: "",
        hours: "",
        lecture: "",
        practice: "",
        lab: "",
        semesters: emptySemesters(),
        hasMismatch: false
      };
    }

    function defaultRows() {
      return [
        makeRow("block", "", 1),
        makeRow("discipline", "", 1),
        makeRow("discipline", "", 1),
        makeRow("discipline", "", 1),
        makeRow("total", text.totalBlock, 1),
        makeRow("grand", text.grandTotal, null)
      ];
    }

    function normalizeRows(list) {
      if (!Array.isArray(list)) return defaultRows();

      return list.map((row) => {
        const rowName =
          row.type === "total"
            ? text.totalBlock
            : row.type === "grand"
              ? text.grandTotal
              : row.name || "";

        const normalized = {
          ...makeRow(row.type || "discipline", rowName, row.blockNo || null),
          ...row,
          name: rowName
        };

        if (!Array.isArray(normalized.semesters)) {
          normalized.semesters = emptySemesters();
        }

        normalized.semesters = Array.from({ length: 8 }, (_, index) => ({
          lecture: normalized.semesters[index]?.lecture || "",
          practice: normalized.semesters[index]?.practice || "",
          lab: normalized.semesters[index]?.lab || "",
          credit: normalized.semesters[index]?.credit || ""
        }));

        normalized.hasMismatch = false;

        return normalized;
      });
    }

    function buildHeader() {
      const head = $("tableHead");
      if (!head) return;

      head.innerHTML = "";

      const tr1 = document.createElement("tr");

      tr1.innerHTML += `<th class="disc-col" rowspan="2">${text.disciplines}</th>`;
      tr1.innerHTML += `<th colspan="2">${text.totalLoad}</th>`;
      tr1.innerHTML += `<th colspan="3">${text.auditorium}</th>`;

      SEMESTERS.forEach((sem, index) => {
        const semNo = index + 1;
        tr1.innerHTML += `<th class="sem-${semNo}" colspan="4">${sem}</th>`;
      });

      const tr2 = document.createElement("tr");

      tr2.innerHTML += `<th>${text.creditsShort}</th>`;
      tr2.innerHTML += `<th>${text.hours}</th>`;
      tr2.innerHTML += `<th>${text.lectureShort}</th>`;
      tr2.innerHTML += `<th>${text.practiceShort}</th>`;
      tr2.innerHTML += `<th>${text.labShort}</th>`;

      for (let i = 0; i < 8; i += 1) {
        const semNo = i + 1;

        tr2.innerHTML += `<th class="sem-${semNo}">${text.lectureShort}</th>`;
        tr2.innerHTML += `<th class="sem-${semNo}">${text.practiceShort}</th>`;
        tr2.innerHTML += `<th class="sem-${semNo}">${text.labShort}</th>`;
        tr2.innerHTML += `<th class="sem-${semNo}">${text.creditsShort}</th>`;
      }

      head.appendChild(tr1);
      head.appendChild(tr2);
    }

    function numberValue(value) {
      const n = parseFloat(String(value || "").replace(",", "."));
      return Number.isNaN(n) ? 0 : n;
    }

    function formatTotal(value) {
      const n = numberValue(value);
      return n === 0 ? "" : String(Number(n.toFixed(2)));
    }

    function clearNumeric(row) {
      row.credits = "";
      row.hours = "";
      row.lecture = "";
      row.practice = "";
      row.lab = "";
      row.semesters = emptySemesters();
      row.hasMismatch = false;
    }

    function copyTotals(from, to) {
      to.credits = formatTotal(from.credits);
      to.hours = formatTotal(from.hours);
      to.lecture = formatTotal(from.lecture);
      to.practice = formatTotal(from.practice);
      to.lab = formatTotal(from.lab);
      to.semesters = emptySemesters();
    }

    function calculateTotals() {
      const blockTotals = {};
      const grand = makeRow("grand", text.grandTotal);

      rows.forEach((row) => {
        row.hasMismatch = false;

        if (row.type === "total" || row.type === "grand") {
          clearNumeric(row);
        }
      });

      rows.forEach((row) => {
        if (row.type !== "discipline") return;

        const blockNo = row.blockNo;

        if (!blockTotals[blockNo]) {
          blockTotals[blockNo] = makeRow("total", text.totalBlock, blockNo);
        }

        const total = blockTotals[blockNo];

        total.credits = numberValue(total.credits) + numberValue(row.credits);
        total.hours = numberValue(total.hours) + numberValue(row.hours);
        total.lecture = numberValue(total.lecture) + numberValue(row.lecture);
        total.practice = numberValue(total.practice) + numberValue(row.practice);
        total.lab = numberValue(total.lab) + numberValue(row.lab);

        grand.credits = numberValue(grand.credits) + numberValue(row.credits);
        grand.hours = numberValue(grand.hours) + numberValue(row.hours);
        grand.lecture = numberValue(grand.lecture) + numberValue(row.lecture);
        grand.practice = numberValue(grand.practice) + numberValue(row.practice);
        grand.lab = numberValue(grand.lab) + numberValue(row.lab);
      });

      rows.forEach((row) => {
        if (row.type === "total" && blockTotals[row.blockNo]) {
          row.name = text.totalBlock;
          copyTotals(blockTotals[row.blockNo], row);
        }

        if (row.type === "grand") {
          row.name = text.grandTotal;
          copyTotals(grand, row);
        }
      });

      rows.forEach((row) => {
        if (row.type !== "total") return;

        const blockRow = rows.find(
          (item) => item.type === "block" && item.blockNo === row.blockNo
        );

        if (!blockRow) return;

        row.hasMismatch =
          numberValue(blockRow.credits) !== numberValue(row.credits) ||
          numberValue(blockRow.hours) !== numberValue(row.hours) ||
          numberValue(blockRow.lecture) !== numberValue(row.lecture) ||
          numberValue(blockRow.practice) !== numberValue(row.practice) ||
          numberValue(blockRow.lab) !== numberValue(row.lab);
      });
    }

    function inputCell(value, callback, className = "", disabled = false, tdClass = "") {
      const td = document.createElement("td");

      if (tdClass) {
        td.className = tdClass;
      }

      const input = document.createElement("input");
      input.className = `cell ${className}`;
      input.value = value || "";
      input.disabled = disabled || !isEditMode || isReadOnly;

      input.addEventListener("change", (event) => {
        callback(event.target.value);
        calculateTotals();
        renderTable();
      });

      td.appendChild(input);
      return td;
    }

    function renderTable() {
      const body = $("tableBody");
      if (!body) return;

      body.innerHTML = "";

      calculateTotals();

      rows.forEach((row) => {
        const tr = document.createElement("tr");

        if (row.type === "block") tr.classList.add("block-row");
        if (row.type === "discipline") tr.classList.add("discipline-row");
        if (row.type === "total") tr.classList.add("total-row");
        if (row.type === "total" && row.hasMismatch) tr.classList.add("mismatch-row");
        if (row.type === "grand") tr.classList.add("grand-total");

        const tdName = document.createElement("td");
        tdName.className = "disc-col";

        if (row.type === "block") {
          const div = document.createElement("div");
          div.className = "block-cell";

          const input = document.createElement("input");
          input.className = "cell discipline-cell";
          input.value = row.name || "";
          input.placeholder = text.blockPlaceholder;
          input.disabled = !isEditMode || isReadOnly;

          input.addEventListener("change", (event) => {
            row.name = event.target.value;
          });

          const plus = document.createElement("button");
          plus.type = "button";
          plus.className = "mini-btn mini-plus edit-only";
          plus.innerHTML = "+";
          plus.title = text.addDisciplineTitle;
          plus.onclick = () => addDisciplineToBlock(row.blockNo);

          const del = document.createElement("button");
          del.type = "button";
          del.className = "mini-btn mini-del edit-only";
          del.innerHTML = "×";
          del.title = text.deleteBlockTitle;
          del.onclick = () => deleteBlock(row.blockNo);

          div.appendChild(input);

          if (!isReadOnly) {
            div.appendChild(plus);
            div.appendChild(del);
          }

          tdName.appendChild(div);
        } else {
          const input = document.createElement("input");
          input.className = "cell discipline-cell";
          input.value = row.name || "";

          if (row.type === "discipline") input.placeholder = text.disciplinePlaceholder;
          if (row.type === "total") input.value = row.name || text.totalBlock;
          if (row.type === "grand") input.value = row.name || text.grandTotal;

          input.disabled =
            row.type === "total" ||
            row.type === "grand" ||
            !isEditMode ||
            isReadOnly;

          input.addEventListener("change", (event) => {
            row.name = event.target.value;
          });

          tdName.appendChild(input);
        }

        tr.appendChild(tdName);

        const isAutoRow = row.type === "total" || row.type === "grand";

        tr.appendChild(inputCell(row.credits, (value) => (row.credits = value), "", isAutoRow));
        tr.appendChild(inputCell(row.hours, (value) => (row.hours = value), "", isAutoRow));
        tr.appendChild(inputCell(row.lecture, (value) => (row.lecture = value), "", isAutoRow));
        tr.appendChild(inputCell(row.practice, (value) => (row.practice = value), "", isAutoRow));
        tr.appendChild(inputCell(row.lab, (value) => (row.lab = value), "", isAutoRow));

        row.semesters.forEach((sem, semIndex) => {
          const semClass = `sem-${semIndex + 1}`;

          tr.appendChild(
            inputCell(sem.lecture, (value) => (sem.lecture = value), "", isAutoRow, semClass)
          );

          tr.appendChild(
            inputCell(sem.practice, (value) => (sem.practice = value), "", isAutoRow, semClass)
          );

          tr.appendChild(
            inputCell(sem.lab, (value) => (sem.lab = value), "", isAutoRow, semClass)
          );

          tr.appendChild(
            inputCell(sem.credit, (value) => (sem.credit = value), "", isAutoRow, semClass)
          );
        });

        body.appendChild(tr);
      });

      updateModeUI();
    }

    function getCurrentPlanInfo() {
      const direction = $("direction")?.value || "ИВТ";
      const year = $("year")?.value || "2025-2026";
      const form = $("studyForm")?.value || "Очная";
      const planId = makePlanDocId(direction, year, form);

      return {
        direction,
        year,
        form,
        planId
      };
    }

    async function loadYears() {
      try {
        const yearsDocRef = doc(db, "settings", "curriculumYears");
        const snapshot = await getDoc(yearsDocRef);

        if (snapshot.exists()) {
          const data = snapshot.data() || {};

          if (Array.isArray(data.years)) {
            years = data.years;
          } else if (Array.isArray(data.items)) {
            years = data.items;
          } else {
            years = DEFAULT_YEARS;
          }
        } else {
          years = DEFAULT_YEARS;

          await setDoc(yearsDocRef, {
            id: "curriculumYears",
            years: DEFAULT_YEARS,
            items: DEFAULT_YEARS,
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
        }

        renderYearsSelect();
      } catch (error) {
        console.error("Load curriculum years error:", error);
        years = DEFAULT_YEARS;
        renderYearsSelect();
        setStatus(text.loadYearsError);
      }
    }

    function renderYearsSelect() {
      const yearSelect = $("year");
      if (!yearSelect) return;

      const currentValue = yearSelect.value || localStorage.getItem("academicYear") || "2025-2026";
      yearSelect.innerHTML = "";

      years.forEach((item) => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item.replace("-", "–");
        yearSelect.appendChild(option);
      });

      if (years.includes(currentValue)) {
        yearSelect.value = currentValue;
      } else if (years.length > 0) {
        yearSelect.value = years[0];
      }
    }

    async function addYear() {
      if (isReadOnly) return;

      const value = window.prompt(text.promptYear);

      if (!value) return;

      const cleanYear = value.trim();

      if (!cleanYear) return;

      if (years.includes(cleanYear)) {
        $("year").value = cleanYear;
        localStorage.setItem("academicYear", cleanYear);
        await loadPlan();
        return;
      }

      years = [...years, cleanYear];

      try {
        await setDoc(
          doc(db, "settings", "curriculumYears"),
          {
            id: "curriculumYears",
            years,
            items: years,
            updatedAt: Date.now()
          },
          { merge: true }
        );

        renderYearsSelect();
        $("year").value = cleanYear;
        localStorage.setItem("academicYear", cleanYear);

        rows = defaultRows();
        isEditMode = true;
        renderTable();

        setStatus(text.newYearAdded);
      } catch (error) {
        console.error("Add curriculum year error:", error);
        setStatus(text.addYearError);
      }
    }

    async function savePlan() {
      if (isReadOnly) return;

      calculateTotals();

      const { direction, year, form, planId } = getCurrentPlanInfo();

      const payload = {
        id: planId,
        direction,
        year,
        studyForm: form,
        qualification: text.bachelor,
        rows,
        updatedAt: Date.now(),
        updatedAtText: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, "curriculumPlans", planId), payload, {
          merge: true
        });

        localStorage.setItem("academicYear", year);

        isEditMode = false;
        renderTable();
        setStatus(text.saved);
      } catch (error) {
        console.error("Save curriculum plan error:", error);
        setStatus(text.saveError);
      }
    }

    async function loadPlan() {
      try {
        const { year, planId } = getCurrentPlanInfo();

        localStorage.setItem("academicYear", year);

        const snapshot = await getDoc(doc(db, "curriculumPlans", planId));

        if (!snapshot.exists()) {
          rows = defaultRows();
          isEditMode = !isReadOnly;
          renderTable();

          setStatus(isReadOnly ? text.noDataTeacher : text.noDataAdmin);

          return;
        }

        const payload = snapshot.data() || {};

        rows = normalizeRows(payload.rows || defaultRows());
        isEditMode = false;
        renderTable();

        setStatus(text.loaded);
      } catch (error) {
        console.error("Load curriculum plan error:", error);
        rows = defaultRows();
        isEditMode = !isReadOnly;
        renderTable();
        setStatus(text.loadError);
      }
    }

    function addDisciplineToBlock(blockNo) {
      if (!isEditMode || isReadOnly) return;

      const totalIndex = rows.findIndex(
        (row) => row.type === "total" && row.blockNo === blockNo
      );

      const insertIndex = totalIndex === -1 ? rows.length - 1 : totalIndex;

      rows.splice(insertIndex, 0, makeRow("discipline", "", blockNo));
      renderTable();
      setStatus(text.disciplineAdded);
    }

    function addBlock() {
      if (!isEditMode || isReadOnly) return;

      const nextBlock =
        Math.max(0, ...rows.filter((row) => row.blockNo).map((row) => row.blockNo)) + 1;

      const grandIndex = rows.findIndex((row) => row.type === "grand");
      const insertIndex = grandIndex === -1 ? rows.length : grandIndex;

      rows.splice(
        insertIndex,
        0,
        makeRow("block", "", nextBlock),
        makeRow("discipline", "", nextBlock),
        makeRow("discipline", "", nextBlock),
        makeRow("total", text.totalBlock, nextBlock)
      );

      renderTable();
      setStatus(text.blockAdded);
    }

    function deleteBlock(blockNo) {
      if (!isEditMode || isReadOnly) return;

      if (!window.confirm(text.confirmDeleteBlock)) return;

      rows = rows.filter((row) => row.blockNo !== blockNo);
      renderTable();
      setStatus(text.blockDeleted);
    }

    function enableEdit() {
      if (isReadOnly) return;

      isEditMode = true;
      renderTable();
      setStatus(text.editEnabled);
    }

    function exportExcel() {
      calculateTotals();

      const direction = $("direction").value;
      const year = $("year").value;
      const form = $("studyForm").value;

      const data = [];

      data.push([text.pageTitle]);
      data.push([text.direction.replace(":", ""), direction]);
      data.push([text.academicYear.replace(":", ""), year]);
      data.push([text.studyForm.replace(":", ""), form]);
      data.push([text.qualification.replace(":", ""), text.bachelor]);
      data.push([]);

      data.push([
        text.disciplines,
        text.creditsShort,
        text.hours,
        text.lectureShort,
        text.practiceShort,
        text.labShort,
        `${text.semester1} ${text.lectureShort}`,
        `${text.semester1} ${text.practiceShort}`,
        `${text.semester1} ${text.labShort}`,
        `${text.semester1} ${text.creditsShort}`,
        `${text.semester2} ${text.lectureShort}`,
        `${text.semester2} ${text.practiceShort}`,
        `${text.semester2} ${text.labShort}`,
        `${text.semester2} ${text.creditsShort}`,
        `${text.semester3} ${text.lectureShort}`,
        `${text.semester3} ${text.practiceShort}`,
        `${text.semester3} ${text.labShort}`,
        `${text.semester3} ${text.creditsShort}`,
        `${text.semester4} ${text.lectureShort}`,
        `${text.semester4} ${text.practiceShort}`,
        `${text.semester4} ${text.labShort}`,
        `${text.semester4} ${text.creditsShort}`,
        `${text.semester5} ${text.lectureShort}`,
        `${text.semester5} ${text.practiceShort}`,
        `${text.semester5} ${text.labShort}`,
        `${text.semester5} ${text.creditsShort}`,
        `${text.semester6} ${text.lectureShort}`,
        `${text.semester6} ${text.practiceShort}`,
        `${text.semester6} ${text.labShort}`,
        `${text.semester6} ${text.creditsShort}`,
        `${text.semester7} ${text.lectureShort}`,
        `${text.semester7} ${text.practiceShort}`,
        `${text.semester7} ${text.labShort}`,
        `${text.semester7} ${text.creditsShort}`,
        `${text.semester8} ${text.lectureShort}`,
        `${text.semester8} ${text.practiceShort}`,
        `${text.semester8} ${text.labShort}`,
        `${text.semester8} ${text.creditsShort}`
      ]);

      rows.forEach((row) => {
        const rowData = [
          row.name || "",
          row.credits || "",
          row.hours || "",
          row.lecture || "",
          row.practice || "",
          row.lab || ""
        ];

        row.semesters.forEach((sem) => {
          rowData.push(
            sem.lecture || "",
            sem.practice || "",
            sem.lab || "",
            sem.credit || ""
          );
        });

        data.push(rowData);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(data);

      worksheet["!cols"] = [
        { wch: 35 },
        { wch: 9 },
        { wch: 9 },
        { wch: 9 },
        { wch: 9 },
        { wch: 9 },
        ...Array.from({ length: 32 }, () => ({ wch: 10 }))
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, text.sheetName);

      XLSX.writeFile(workbook, `${text.fileName}_${direction}_${year}_${form}.xlsx`);

      setStatus(text.exported);
    }

    function setStatus(statusTextValue) {
      const statusText = $("statusText");
      if (statusText) statusText.textContent = statusTextValue;
    }

    function updateModeUI() {
      root.classList.toggle("readonly", !isEditMode || isReadOnly);
      root.classList.toggle("teacher-mode", isTeacher);
      root.classList.toggle("lab-mode", isLab);

      const badge = $("modeBadge");
      if (!badge) return;

      if (isReadOnly) {
        badge.textContent = text.viewMode;
        badge.className = "mode-badge mode-read";
        return;
      }

      if (isEditMode) {
        badge.textContent = text.editMode;
        badge.className = "mode-badge mode-edit";
      } else {
        badge.textContent = text.viewMode;
        badge.className = "mode-badge mode-read";
      }
    }

    const directionSelect = $("direction");
    const yearSelect = $("year");
    const studyFormSelect = $("studyForm");
    const editBtn = $("editBtn");
    const saveBtn = $("saveBtn");
    const addBlockBtn = $("addBlockBtn");
    const addYearBtn = $("addYearBtn");
    const excelBtn = $("excelBtn");

    if (directionSelect) directionSelect.addEventListener("change", loadPlan);
    if (yearSelect) yearSelect.addEventListener("change", loadPlan);
    if (studyFormSelect) studyFormSelect.addEventListener("change", loadPlan);

    if (!isReadOnly) {
      if (editBtn) editBtn.addEventListener("click", enableEdit);
      if (saveBtn) saveBtn.addEventListener("click", savePlan);
      if (addBlockBtn) addBlockBtn.addEventListener("click", addBlock);
      if (addYearBtn) addYearBtn.addEventListener("click", addYear);
    }

    if (excelBtn) excelBtn.addEventListener("click", exportExcel);

    async function init() {
      buildHeader();
      rows = defaultRows();
      renderTable();
      await loadYears();
      await loadPlan();
      setStatus(text.statusReady);
      updateModeUI();
    }

    init();

    return () => {
      if (directionSelect) directionSelect.removeEventListener("change", loadPlan);
      if (yearSelect) yearSelect.removeEventListener("change", loadPlan);
      if (studyFormSelect) studyFormSelect.removeEventListener("change", loadPlan);

      if (!isReadOnly) {
        if (editBtn) editBtn.removeEventListener("click", enableEdit);
        if (saveBtn) saveBtn.removeEventListener("click", savePlan);
        if (addBlockBtn) addBlockBtn.removeEventListener("click", addBlock);
        if (addYearBtn) addYearBtn.removeEventListener("click", addYear);
      }

      if (excelBtn) excelBtn.removeEventListener("click", exportExcel);
    };
  }, [isReadOnly, isTeacher, isLab, language, text]);

  return (
    <div ref={rootRef} className="curriculum-body">
      <div className="plan-page" id="mainArea">
        <div className="top-panel">
          <div className="title-box">
            <h1>{text.pageTitle}</h1>

            <div className="meta">
              <label>
                {text.direction}
                <select id="direction">
                  <option value="ИВТ">ИВТ</option>
                  <option value="ПИЭ">ПИЭ</option>
                </select>
              </label>

              <label>
                {text.academicYear}
                <select id="year" defaultValue="2025-2026"></select>
              </label>

              {!isReadOnly && (
                <button type="button" className="btn-secondary small-action" id="addYearBtn">
                  {text.addYear}
                </button>
              )}

              <label>
                {text.studyForm}
                <select id="studyForm">
                  <option value="Очная">{text.fullTime}</option>
                  <option value="Заочная">{text.partTime}</option>
                </select>
              </label>

              <span>
                {text.qualification} <b>{text.bachelor}</b>
              </span>
            </div>
          </div>

          <div className="actions">
            {!isReadOnly && (
              <>
                <button type="button" className="btn-secondary" id="editBtn">
                  {text.edit}
                </button>

                <button type="button" className="btn-primary" id="saveBtn">
                  {text.save}
                </button>

                <button type="button" className="btn-secondary edit-only" id="addBlockBtn">
                  {text.addBlock}
                </button>
              </>
            )}

            <button type="button" className="btn-secondary excel-btn" id="excelBtn">
              {text.exportExcel}
            </button>
          </div>
        </div>

        <div className="status-bar">
          <span id="statusText">{text.statusReady}</span>

          <span id="modeBadge" className="mode-badge mode-read">
            {text.viewMode}
          </span>
        </div>

        <div className="table-wrapper" id="tableWrapper">
          <table id="planTable">
            <thead id="tableHead"></thead>
            <tbody id="tableBody"></tbody>
          </table>
        </div>
      </div>
    </div>
  );
}