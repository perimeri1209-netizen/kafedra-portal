// src/components/Admin/SchedulePage.js

import React, { useEffect, useMemo, useState } from "react";
import {
  db,
  doc,
  setDoc,
  onSnapshot
} from "../../firebase";
import "./SchedulePage.css";

const translations = {
  ru: {
    days: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"],
    scheduleTitle: "Расписание",
    scheduleSubtitle: "Расписание занятий по направлению, курсу, семестру и учебному году",
    edit: "Изменить",
    cancel: "Отмена",
    save: "Сохранить",
    print: "Печать",
    direction: "Направление",
    course: "Курс",
    semester: "Семестр",
    studyYear: "Учебный год",
    addYear: "Добавить год",
    editSelected: "Изменить выбранный",
    semesterNotSelected: "Семестр не выбран",
    yearNotSelected: "Год не выбран",
    noData: "Пока нет данных",
    choose: "Выберите",
    schedulePrintTitle: "Расписание занятий",
    day: "День",
    time: "Время",
    discipline: "Дисциплина",
    teacher: "Преподаватель",
    lessonType: "Тип занятия",
    room: "Ауд.",
    chooseTeacher: "Выберите преподавателя",
    lecture: "Лекция",
    practice: "Практика",
    laboratory: "Лаборатория",
    lecturePractice: "Лек/прак",
    autumnSemester: "Күзгү семестр",
    springSemester: "Жазгы семестр",
    selectAll: "Выберите направление, курс, семестр и учебный год",
    chooseBeforeSave: "Выберите направление, курс, семестр и учебный год",
    settingsSaveError: "Ошибка сохранения настроек",
    settingsLoadError: "Ошибка загрузки настроек",
    scheduleSaved: "Расписание сохранено",
    scheduleSaveError: "Ошибка сохранения расписания",
    scheduleLoaded: "Расписание загружено",
    scheduleEmpty: "Для выбранных данных расписание пока не добавлено",
    scheduleLoadError: "Ошибка загрузки расписания",
    promptYear: "Введите учебный год, например 2025-2026",
    editYearPrompt: "Изменить учебный год",
    chooseYearFirst: "Сначала выберите учебный год",
    yearExists: "Такой учебный год уже есть",
    loading: "Загрузка...",
    studentInfoNotFound: "У студента не указан курс или направление"
  },

  kg: {
    days: ["Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума"],
    scheduleTitle: "Расписание",
    scheduleSubtitle: "Багыт, курс, семестр жана окуу жылы боюнча сабактардын расписаниеси",
    edit: "Өзгөртүү",
    cancel: "Жокко чыгаруу",
    save: "Сактоо",
    print: "Басып чыгаруу",
    direction: "Багыт",
    course: "Курс",
    semester: "Семестр",
    studyYear: "Окуу жылы",
    addYear: "Жыл кошуу",
    editSelected: "Тандалганды өзгөртүү",
    semesterNotSelected: "Семестр тандалган жок",
    yearNotSelected: "Жыл тандалган жок",
    noData: "Азырынча маалымат жок",
    choose: "Тандаңыз",
    schedulePrintTitle: "Сабактардын расписаниеси",
    day: "Күн",
    time: "Убакыт",
    discipline: "Дисциплина",
    teacher: "Окутуучу",
    lessonType: "Сабактын түрү",
    room: "Ауд.",
    chooseTeacher: "Окутуучуну тандаңыз",
    lecture: "Лекция",
    practice: "Практика",
    laboratory: "Лаборатория",
    lecturePractice: "Лек/прак",
    autumnSemester: "Күзгү семестр",
    springSemester: "Жазгы семестр",
    selectAll: "Багытты, курсту, семестрди жана окуу жылын тандаңыз",
    chooseBeforeSave: "Багытты, курсту, семестрди жана окуу жылын тандаңыз",
    settingsSaveError: "Жөндөөлөрдү сактоодо ката кетти",
    settingsLoadError: "Жөндөөлөрдү жүктөөдө ката кетти",
    scheduleSaved: "Расписание сакталды",
    scheduleSaveError: "Расписаниени сактоодо ката кетти",
    scheduleLoaded: "Расписание жүктөлдү",
    scheduleEmpty: "Тандалган маалымат боюнча расписание азырынча жок",
    scheduleLoadError: "Расписаниени жүктөөдө ката кетти",
    promptYear: "Окуу жылын жазыңыз, мисалы 2025-2026",
    editYearPrompt: "Окуу жылын өзгөртүү",
    chooseYearFirst: "Алгач окуу жылын тандаңыз",
    yearExists: "Мындай окуу жылы бар",
    loading: "Жүктөлүүдө...",
    studentInfoNotFound: "Студенттин курсу же багыты көрсөтүлгөн эмес"
  },

  en: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    scheduleTitle: "Schedule",
    scheduleSubtitle: "Class schedule by direction, course, semester and academic year",
    edit: "Edit",
    cancel: "Cancel",
    save: "Save",
    print: "Print",
    direction: "Direction",
    course: "Course",
    semester: "Semester",
    studyYear: "Academic year",
    addYear: "Add year",
    editSelected: "Edit selected",
    semesterNotSelected: "Semester not selected",
    yearNotSelected: "Academic year not selected",
    noData: "No data yet",
    choose: "Choose",
    schedulePrintTitle: "Class schedule",
    day: "Day",
    time: "Time",
    discipline: "Discipline",
    teacher: "Teacher",
    lessonType: "Lesson type",
    room: "Room",
    chooseTeacher: "Choose teacher",
    lecture: "Lecture",
    practice: "Practice",
    laboratory: "Laboratory",
    lecturePractice: "Lecture/practice",
    autumnSemester: "Күзгү семестр",
    springSemester: "Жазгы семестр",
    selectAll: "Choose direction, course, semester and academic year",
    chooseBeforeSave: "Choose direction, course, semester and academic year",
    settingsSaveError: "Settings save error",
    settingsLoadError: "Settings load error",
    scheduleSaved: "Schedule saved",
    scheduleSaveError: "Schedule save error",
    scheduleLoaded: "Schedule loaded",
    scheduleEmpty: "No schedule for selected data yet",
    scheduleLoadError: "Schedule load error",
    promptYear: "Enter academic year, for example 2025-2026",
    editYearPrompt: "Edit academic year",
    chooseYearFirst: "Choose academic year first",
    yearExists: "This academic year already exists",
    loading: "Loading...",
    studentInfoNotFound: "Student course or direction is not specified"
  }
};

const times = [
  "8.00-9.20",
  "9.30-10.50",
  "11.00-12.20",
  "12.30-13.50",
  "14.00-15.20"
];

const fixedDirections = ["ИВТ", "ПИЭ"];
const fixedCourses = ["1 курс", "2 курс", "3 курс", "4 курс"];
const fixedSemesters = ["Күзгү семестр", "Жазгы семестр"];

function normalizeDirection(value, fallback = "") {
  if (!value) return fallback;

  const str = String(value).trim().toUpperCase();

  if (str.includes("ПИЭ")) return "ПИЭ";
  if (str.includes("ИВТ")) return "ИВТ";

  return fallback;
}

function normalizeCourse(value, fallback = "") {
  if (!value) return fallback;

  const str = String(value).trim().toLowerCase();

  if (str.includes("1")) return "1 курс";
  if (str.includes("2")) return "2 курс";
  if (str.includes("3")) return "3 курс";
  if (str.includes("4")) return "4 курс";

  return fallback;
}

function normalizeRole(value = "") {
  const role = String(value || "").trim().toLowerCase();

  if (role === "admin" || role === "администратор") return "admin";

  if (
    role === "teacher" ||
    role === "преподаватель" ||
    role === "мугалим" ||
    role === "окутуучу"
  ) {
    return "teacher";
  }

  if (
    role === "lab" ||
    role === "laborant" ||
    role === "лаборант"
  ) {
    return "lab";
  }

  if (role === "student" || role === "студент") return "student";

  return role || "admin";
}

function getTeacherName(teacher = {}) {
  return (
    teacher.fullName ||
    teacher.name ||
    teacher.displayName ||
    teacher.email ||
    ""
  );
}

function createEmptySchedule(daysList) {
  const rows = [];

  daysList.forEach((day) => {
    times.forEach((time, index) => {
      rows.push({
        day,
        time,
        discipline: "",
        teacherId: "",
        teacherName: "",
        lessonType: "",
        room: "",
        isFirstRowOfDay: index === 0
      });
    });
  });

  return rows;
}

function normalizeRowsDays(rows, daysList) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return createEmptySchedule(daysList);
  }

  const emptyRows = createEmptySchedule(daysList);

  return emptyRows.map((emptyRow, index) => {
    const row = rows[index] || {};

    return {
      ...emptyRow,
      ...row,
      day: emptyRow.day,
      time: row.time || emptyRow.time,
      discipline: row.discipline || "",
      teacherId: row.teacherId || "",
      teacherName: row.teacherName || "",
      lessonType: row.lessonType || "",
      room: row.room || "",
      isFirstRowOfDay: emptyRow.isFirstRowOfDay
    };
  });
}

function makeScheduleDocId({ direction, course, studyYear, semester }) {
  return [direction, course, studyYear, semester]
    .map((item) =>
      String(item || "")
        .trim()
        .replaceAll("/", "-")
        .replaceAll("\\", "-")
        .replace(/\s+/g, "_")
    )
    .join("__");
}

function EditableSelect({
  label,
  value,
  options,
  onChange,
  onAdd,
  onEdit,
  addText,
  editText,
  canManage = false,
  canSelect = true,
  placeholder = "Выберите",
  emptyText = "Пока нет данных"
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="editable-select">
      <label className="editable-select-label">{label}</label>

      <button
        type="button"
        className="editable-select-main"
        disabled={!canSelect}
        onClick={() => canSelect && setOpen((prev) => !prev)}
      >
        <span>{value || placeholder}</span>
        <span className="editable-select-arrow">▾</span>
      </button>

      {open && (
        <div className="editable-select-menu">
          {options.length === 0 && (
            <div className="editable-select-empty">{emptyText}</div>
          )}

          {options.map((item) => (
            <button
              type="button"
              key={item}
              className={`editable-select-option ${
                item === value ? "active" : ""
              }`}
              onClick={() => {
                onChange(item);
                setOpen(false);
              }}
            >
              {item}
            </button>
          ))}

          {canManage && (
            <>
              <div className="editable-select-divider" />

              <button
                type="button"
                className="editable-select-action"
                onClick={() => {
                  setOpen(false);
                  onAdd();
                }}
              >
                + {addText}
              </button>

              <button
                type="button"
                className="editable-select-action"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
              >
                {editText}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function SchedulePage({
  mode = "admin",
  role = mode,
  teachers = [],
  currentStudent = null,
  currentTeacher = null,
  language = "ru",
  t: parentT = {},
  readOnly = false,
  readonly = false
}) {
  const text = {
    ...(translations[language] || translations.ru),
    ...parentT
  };

  const days = text.days || translations.ru.days;

  const normalizedMode = normalizeRole(mode);
  const normalizedRole = normalizeRole(role || mode);

  const isAdmin = normalizedMode === "admin" || normalizedRole === "admin";
  const isTeacher = normalizedMode === "teacher" || normalizedRole === "teacher";
  const isLab = normalizedMode === "lab" || normalizedRole === "lab";
  const isStudent = normalizedMode === "student" || normalizedRole === "student";

  const isReadOnly = Boolean(readOnly || readonly);

  const studentDirection = normalizeDirection(
    currentStudent?.direction ||
      currentStudent?.department ||
      currentStudent?.speciality,
    ""
  );

  const studentCourse = normalizeCourse(currentStudent?.course, "");

  const studentStudyYear =
    currentStudent?.studyYear ||
    currentStudent?.academicYear ||
    localStorage.getItem("academicYear") ||
    "";

  const studentSemester =
    currentStudent?.semester ||
    currentStudent?.currentSemester ||
    "Күзгү семестр";

  const [direction, setDirection] = useState(() => {
    if (isStudent) return studentDirection;
    return "ИВТ";
  });

  const [course, setCourse] = useState(() => {
    if (isStudent) return studentCourse;
    return "1 курс";
  });

  const [studyYears, setStudyYears] = useState([]);

  const [semester, setSemester] = useState(() => {
    if (isStudent) return studentSemester;
    return "Күзгү семестр";
  });

  const [studyYear, setStudyYear] = useState(() => {
    if (isStudent) return studentStudyYear;
    return localStorage.getItem("academicYear") || "";
  });

  const [rows, setRows] = useState(() => createEmptySchedule(days));
  const [isEdit, setIsEdit] = useState(false);
  const [status, setStatus] = useState(text.selectAll);
  const [settingsReady, setSettingsReady] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const defaultRows = useMemo(() => createEmptySchedule(days), [days]);

  const canShowFilters = !isStudent;

  /*
    access logic:
    none -> sidebar бул компонентти көрсөтпөйт
    read -> readOnly=true, таблица көрүнөт, бирок өзгөртүү жок
    edit -> readOnly=false, өзгөртүү/сактоо иштейт
  */
  const canManageSchedule = !isStudent && !isReadOnly;
  const canEditSchedule = canManageSchedule && isEdit;

  function getScheduleDocId() {
    if (!direction || !course || !studyYear || !semester) {
      return null;
    }

    return makeScheduleDocId({
      direction,
      course,
      studyYear,
      semester
    });
  }

  async function saveSettings(nextSettings) {
    if (!canManageSchedule) return;

    try {
      const nextYears = Array.isArray(nextSettings.studyYears)
        ? nextSettings.studyYears
        : [];

      await setDoc(
        doc(db, "scheduleSettings", "main"),
        {
          semesters: fixedSemesters,
          studyYears: nextYears,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      setStudyYears(nextYears);
    } catch (error) {
      console.error(error);
      alert(text.settingsSaveError);
    }
  }

  async function saveSchedule() {
    if (!canManageSchedule) return;

    const scheduleDocId = getScheduleDocId();

    if (!scheduleDocId) {
      alert(text.chooseBeforeSave);
      return;
    }

    const payload = {
      direction,
      course,
      semester,
      studyYear,
      rows: normalizeRowsDays(rows, days),
      updatedAt: new Date().toISOString(),
      updatedByRole: normalizedRole,
      updatedByName:
        currentTeacher?.fullName ||
        currentTeacher?.name ||
        currentTeacher?.email ||
        ""
    };

    try {
      await setDoc(doc(db, "schedules", scheduleDocId), payload, {
        merge: true
      });

      setIsEdit(false);
      setStatus(text.scheduleSaved);
    } catch (error) {
      console.error(error);
      setStatus(text.scheduleSaveError);
    }
  }

  async function addStudyYear() {
    if (!canManageSchedule) return;

    const value = prompt(text.promptYear);

    if (!value) return;

    const newYear = value.trim();

    if (!newYear) return;

    if (studyYears.includes(newYear)) {
      alert(text.yearExists);
      return;
    }

    const nextYears = [...studyYears, newYear];

    await saveSettings({
      studyYears: nextYears
    });

    setStudyYear(newYear);
    localStorage.setItem("academicYear", newYear);
  }

  async function editStudyYear() {
    if (!canManageSchedule) return;

    if (!studyYear) {
      alert(text.chooseYearFirst);
      return;
    }

    const value = prompt(text.editYearPrompt, studyYear);

    if (!value) return;

    const newYear = value.trim();

    if (!newYear) return;

    if (studyYears.includes(newYear) && newYear !== studyYear) {
      alert(text.yearExists);
      return;
    }

    const nextYears = studyYears.map((item) =>
      item === studyYear ? newYear : item
    );

    await saveSettings({
      studyYears: nextYears
    });

    setStudyYear(newYear);
    localStorage.setItem("academicYear", newYear);
  }

  function updateCell(index, field, value) {
    if (!canEditSchedule) return;

    setRows((prevRows) => {
      const updatedRows = [...prevRows];

      updatedRows[index] = {
        ...updatedRows[index],
        [field]: value
      };

      return updatedRows;
    });
  }

  function updateTeacher(index, teacherId) {
    if (!canEditSchedule) return;

    const selectedTeacher = teachers.find(
      (teacher) => String(teacher.id) === String(teacherId)
    );

    setRows((prevRows) => {
      const updatedRows = [...prevRows];

      updatedRows[index] = {
        ...updatedRows[index],
        teacherId,
        teacherName: selectedTeacher ? getTeacherName(selectedTeacher) : ""
      };

      return updatedRows;
    });
  }

  function printSchedule() {
    window.print();
  }

  function handleCancelEdit() {
    setIsEdit(false);
  }

  function renderDisciplineCell(row, index) {
    if (canEditSchedule) {
      return (
        <textarea
          value={row.discipline || ""}
          onChange={(event) =>
            updateCell(index, "discipline", event.target.value)
          }
          placeholder={text.discipline}
        />
      );
    }

    return <div className="schedule-readonly-cell">{row.discipline || ""}</div>;
  }

  function renderTeacherCell(row, index) {
    if (canEditSchedule) {
      return (
        <select
          className="teacher-select"
          value={row.teacherId || ""}
          onChange={(event) => updateTeacher(index, event.target.value)}
        >
          <option value="">{text.chooseTeacher}</option>

          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {getTeacherName(teacher)}
            </option>
          ))}
        </select>
      );
    }

    return <div className="schedule-readonly-cell">{row.teacherName || ""}</div>;
  }

  function renderLessonTypeCell(row, index) {
    if (canEditSchedule) {
      return (
        <select
          className="type-select"
          value={row.lessonType || ""}
          onChange={(event) =>
            updateCell(index, "lessonType", event.target.value)
          }
        >
          <option value="">{text.choose}</option>
          <option value={text.lecture}>{text.lecture}</option>
          <option value={text.practice}>{text.practice}</option>
          <option value={text.laboratory}>{text.laboratory}</option>
          <option value={text.lecturePractice}>{text.lecturePractice}</option>
        </select>
      );
    }

    return <div className="schedule-readonly-cell">{row.lessonType || ""}</div>;
  }

  function renderRoomCell(row, index) {
    if (canEditSchedule) {
      return (
        <input
          value={row.room || ""}
          onChange={(event) => updateCell(index, "room", event.target.value)}
          placeholder={text.room}
        />
      );
    }

    return <div className="schedule-readonly-cell">{row.room || ""}</div>;
  }

  useEffect(() => {
    setRows((prevRows) => normalizeRowsDays(prevRows, days));
  }, [days]);

  useEffect(() => {
    if (!isStudent) return;

    setDirection(studentDirection);
    setCourse(studentCourse);
    setSemester(studentSemester || "Күзгү семестр");

    if (studentStudyYear) {
      setStudyYear(studentStudyYear);
    }
  }, [
    isStudent,
    studentDirection,
    studentCourse,
    studentSemester,
    studentStudyYear
  ]);

  useEffect(() => {
    if (!canManageSchedule && isEdit) {
      setIsEdit(false);
    }
  }, [canManageSchedule, isEdit]);

  useEffect(() => {
    const settingsDocRef = doc(db, "scheduleSettings", "main");

    const unsubscribe = onSnapshot(
      settingsDocRef,
      async (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.data() || {};
            const loadedYears = Array.isArray(data.studyYears)
              ? data.studyYears
              : [];

            setStudyYears(loadedYears);

            if (isStudent) {
              if (studentStudyYear) {
                setStudyYear(studentStudyYear);
              } else if (loadedYears.length > 0) {
                setStudyYear(loadedYears[0]);
              } else {
                setStudyYear("");
              }
            } else {
              const savedYear = localStorage.getItem("academicYear");

              if (loadedYears.length > 0) {
                if (savedYear && loadedYears.includes(savedYear)) {
                  setStudyYear(savedYear);
                } else {
                  setStudyYear(loadedYears[0]);
                  localStorage.setItem("academicYear", loadedYears[0]);
                }
              } else {
                setStudyYear("");
              }
            }

            if (!fixedSemesters.includes(semester)) {
              setSemester("Күзгү семестр");
            }
          } else {
            if (canManageSchedule) {
              await setDoc(settingsDocRef, {
                semesters: fixedSemesters,
                studyYears: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }

            setStudyYears([]);
            setStudyYear("");
            setSemester("Күзгү семестр");
          }

          setSettingsReady(true);
        } catch (error) {
          console.error(error);
          setSettingsReady(true);
          setStatus(text.settingsLoadError);
        }
      },
      (error) => {
        console.error(error);
        setSettingsReady(true);
        setStatus(text.settingsLoadError);
      }
    );

    return () => unsubscribe();
  }, [
    canManageSchedule,
    isStudent,
    language,
    studentStudyYear,
    semester,
    text.settingsLoadError
  ]);

  useEffect(() => {
    if (!settingsReady) return;

    const scheduleDocId = getScheduleDocId();

    if (isStudent && (!studentDirection || !studentCourse)) {
      setRows(defaultRows);
      setStatus(text.studentInfoNotFound);
      return;
    }

    if (!scheduleDocId) {
      setRows(defaultRows);
      setStatus(text.selectAll);
      return;
    }

    setScheduleLoading(true);

    const scheduleDocRef = doc(db, "schedules", scheduleDocId);

    const unsubscribe = onSnapshot(
      scheduleDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() || {};
          const loadedRows = normalizeRowsDays(
            data.rows || createEmptySchedule(days),
            days
          );

          setRows(loadedRows);
          setStatus(text.scheduleLoaded);
        } else {
          setRows(createEmptySchedule(days));
          setStatus(text.scheduleEmpty);
        }

        setIsEdit(false);
        setScheduleLoading(false);
      },
      (error) => {
        console.error(error);
        setRows(createEmptySchedule(days));
        setStatus(text.scheduleLoadError);
        setScheduleLoading(false);
      }
    );

    return () => unsubscribe();
  }, [
    settingsReady,
    direction,
    course,
    studyYear,
    semester,
    language,
    isStudent,
    studentDirection,
    studentCourse,
    defaultRows,
    days,
    text.studentInfoNotFound,
    text.selectAll,
    text.scheduleLoaded,
    text.scheduleEmpty,
    text.scheduleLoadError
  ]);

  const subtitleText = isStudent
    ? `${direction || "-"} | ${course || "-"}`
    : `${direction || "-"} | ${course || "-"} | ${semester || "-"} | ${
        studyYear || "-"
      }`;

  return (
    <div
      className={`schedule-page ${
        isStudent ? "schedule-student-view" : ""
      } ${isTeacher ? "schedule-teacher-view" : ""} ${
        isLab ? "schedule-lab-view" : ""
      } ${isReadOnly ? "schedule-readonly-view" : "schedule-edit-access-view"}`}
    >
      <div className="schedule-card">
        <div className="schedule-top no-print">
          <div>
            <h1>{text.scheduleTitle}</h1>
            <p>{text.scheduleSubtitle}</p>
          </div>

          <div className="schedule-actions">
            {canManageSchedule && (
              <>
                {!isEdit ? (
                  <button
                    type="button"
                    className="schedule-btn light"
                    onClick={() => setIsEdit(true)}
                  >
                    {text.edit}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="schedule-btn light"
                    onClick={handleCancelEdit}
                  >
                    {text.cancel}
                  </button>
                )}

                {isEdit && (
                  <button
                    type="button"
                    className="schedule-btn dark"
                    onClick={saveSchedule}
                  >
                    {text.save}
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              className="schedule-btn light"
              onClick={printSchedule}
            >
              {text.print}
            </button>
          </div>
        </div>

        {canShowFilters && (
          <div className="schedule-filters no-print">
            <div className="filter-select">
              <label>{text.direction}</label>

              <select
                value={direction}
                onChange={(event) => setDirection(event.target.value)}
              >
                {fixedDirections.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-select">
              <label>{text.course}</label>

              <select
                value={course}
                onChange={(event) => setCourse(event.target.value)}
              >
                {fixedCourses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <EditableSelect
              label={text.semester}
              value={semester}
              options={fixedSemesters}
              onChange={setSemester}
              onAdd={() => {}}
              onEdit={() => {}}
              addText=""
              editText=""
              canManage={false}
              canSelect={true}
              placeholder={text.semesterNotSelected}
              emptyText={text.noData}
            />

            <EditableSelect
              label={text.studyYear}
              value={studyYear}
              options={studyYears}
              onChange={(year) => {
                setStudyYear(year);
                localStorage.setItem("academicYear", year);
              }}
              onAdd={addStudyYear}
              onEdit={editStudyYear}
              addText={text.addYear}
              editText={text.editSelected}
              canManage={canManageSchedule}
              canSelect={true}
              placeholder={text.yearNotSelected}
              emptyText={text.noData}
            />
          </div>
        )}

        <div className="schedule-title-print">
          <h2>{text.schedulePrintTitle}</h2>
          <p>{subtitleText}</p>
        </div>

        {scheduleLoading && (
          <div className="schedule-status no-print">{text.loading}</div>
        )}

        {!scheduleLoading && status && !isStudent && (
          <div className="schedule-status no-print">{status}</div>
        )}

        {!scheduleLoading && status && isStudent && (!direction || !course) && (
          <div className="schedule-status no-print">{status}</div>
        )}

        <div className="schedule-table-wrapper">
          <table className="schedule-main-table">
            <thead>
              <tr>
                <th className="day-col">{text.day}</th>
                <th className="time-col">{text.time}</th>
                <th>{text.discipline}</th>
                <th>{text.teacher}</th>
                <th className="type-col">{text.lessonType}</th>
                <th className="room-col">{text.room}</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.day}-${row.time}-${index}`}>
                  {row.isFirstRowOfDay && (
                    <td className="day-cell" rowSpan={times.length}>
                      <span>{row.day}</span>
                    </td>
                  )}

                  <td className="time-cell">{row.time}</td>
                  <td>{renderDisciplineCell(row, index)}</td>
                  <td>{renderTeacherCell(row, index)}</td>
                  <td>{renderLessonTypeCell(row, index)}</td>
                  <td>{renderRoomCell(row, index)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="schedule-bottom-space" />
      </div>
    </div>
  );
}