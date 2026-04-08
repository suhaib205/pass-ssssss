(function attachNursingQuizVod(window) {
  "use strict";

  var STORAGE_KEY = "nq-vod-platform-state-v1";
  var ADMIN_EMAIL = "admin@nursing-quiz.org";
  var ADMIN_PASSWORD = "adminnursing";
  var CURRENT_USER_EMAIL = "lina.haddad@nursing-quiz.com";
  var CURRENT_USER_ID = "STU-4821";
  var TODAY = "2026-04-09";

  function isoNow() {
    return new Date().toISOString();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function sum(values) {
    return values.reduce(function reducer(total, value) {
      return total + value;
    }, 0);
  }

  function clamp(number, min, max) {
    return Math.max(min, Math.min(max, number));
  }

  var LIBRARY = [
    {
      id: "subject-med-surg",
      title: "Medical-Surgical Nursing",
      chapters: [
        {
          id: "chapter-respiratory",
          title: "Respiratory Emergencies",
          lessons: [
            {
              id: "lesson-airway-assessment",
              title: "Airway Assessment Foundations",
              durationMinutes: 18,
              sourceType: "video",
              sourceUrl:
                "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
              summary:
                "Rapid airway prioritization, red flags, and escalation language for high-stakes exam scenarios.",
              tags: ["Airway", "NCLEX style", "Priority setting"],
              attachments: [
                {
                  title: "Airway assessment checklist",
                  type: "Cheat sheet",
                  url: "./assets/attachments/airway-checklist.txt"
                },
                {
                  title: "ABG rapid review card",
                  type: "Image",
                  url: "./assets/attachments/abg-cheat-sheet.svg"
                }
              ]
            },
            {
              id: "lesson-abg-interpretation",
              title: "ABG Interpretation for Exam Traps",
              durationMinutes: 21,
              sourceType: "youtube",
              sourceUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
              summary:
                "A protected YouTube lesson focused on acid-base reading patterns and common distractors.",
              tags: ["ABG", "Acid-base", "White-label player"],
              attachments: [
                {
                  title: "ABG visual guide",
                  type: "Image",
                  url: "./assets/attachments/abg-cheat-sheet.svg"
                }
              ]
            }
          ]
        },
        {
          id: "chapter-cardiac",
          title: "Cardiac Priorities",
          lessons: [
            {
              id: "lesson-acs-review",
              title: "Acute Coronary Syndrome Review",
              durationMinutes: 24,
              sourceType: "video",
              sourceUrl:
                "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              summary:
                "Chest pain algorithms, time-sensitive interventions, and high-yield prioritization cues.",
              tags: ["Cardiac", "Emergency", "Monitoring"],
              attachments: [
                {
                  title: "ACS summary sheet",
                  type: "Summary",
                  url: "./assets/attachments/cardiac-summary.txt"
                }
              ]
            },
            {
              id: "lesson-arrhythmia-recognition",
              title: "Arrhythmia Rapid Recognition",
              durationMinutes: 17,
              sourceType: "video",
              sourceUrl:
                "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscape.mp4",
              summary:
                "Distinguish unstable rhythms quickly and select the next safest nursing action.",
              tags: ["Rhythms", "Telemetry", "Rapid review"],
              attachments: [
                {
                  title: "ACS summary sheet",
                  type: "Summary",
                  url: "./assets/attachments/cardiac-summary.txt"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "subject-pharmacology",
      title: "Pharmacology",
      chapters: [
        {
          id: "chapter-high-alert",
          title: "High-Alert Medications",
          lessons: [
            {
              id: "lesson-dose-calculations",
              title: "Safe Dose Calculations",
              durationMinutes: 14,
              sourceType: "video",
              sourceUrl:
                "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
              summary:
                "A practical walkthrough for high-risk medication math and label reading under exam pressure.",
              tags: ["Dosage", "Medication safety", "Ratios"],
              attachments: [
                {
                  title: "Airway assessment checklist",
                  type: "Reference",
                  url: "./assets/attachments/airway-checklist.txt"
                }
              ]
            },
            {
              id: "lesson-anticoagulant-safety",
              title: "Anticoagulant Safety",
              durationMinutes: 16,
              sourceType: "youtube",
              sourceUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
              summary:
                "Protected external delivery for anticoagulant safety cues, bleeding priorities, and lab interpretation.",
              tags: ["Anticoagulants", "Labs", "Protected embed"],
              attachments: [
                {
                  title: "Medication summary sheet",
                  type: "Summary",
                  url: "./assets/attachments/cardiac-summary.txt"
                }
              ]
            }
          ]
        },
        {
          id: "chapter-antibiotics",
          title: "Antibiotics",
          lessons: [
            {
              id: "lesson-culture-before-antibiotics",
              title: "Culture Before Antibiotics",
              durationMinutes: 12,
              sourceType: "video",
              sourceUrl:
                "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              summary:
                "Timing logic, culture collection, and common pharmacology sequencing mistakes.",
              tags: ["Specimens", "Timing", "Safety"],
              attachments: [
                {
                  title: "Medication summary sheet",
                  type: "Summary",
                  url: "./assets/attachments/cardiac-summary.txt"
                }
              ]
            },
            {
              id: "lesson-adverse-reactions",
              title: "Adverse Reaction Red Flags",
              durationMinutes: 15,
              sourceType: "video",
              sourceUrl:
                "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
              summary:
                "Focus on first-dose reactions, escalation language, and when to hold medication administration.",
              tags: ["Adverse effects", "Monitoring", "Safety"],
              attachments: [
                {
                  title: "Medication summary sheet",
                  type: "Summary",
                  url: "./assets/attachments/cardiac-summary.txt"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "subject-maternal",
      title: "Maternal and Newborn",
      chapters: [
        {
          id: "chapter-labor",
          title: "Labor Monitoring",
          lessons: [
            {
              id: "lesson-fetal-heart-patterns",
              title: "Fetal Heart Rate Patterns",
              durationMinutes: 20,
              sourceType: "video",
              sourceUrl:
                "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
              summary:
                "Recognize reassuring and non-reassuring tracing patterns with escalation actions.",
              tags: ["FHR", "Labor", "Priorities"],
              attachments: [
                {
                  title: "FHR pattern guide",
                  type: "Image",
                  url: "./assets/attachments/fhr-patterns.svg"
                }
              ]
            },
            {
              id: "lesson-preeclampsia-escalation",
              title: "Preeclampsia Escalation",
              durationMinutes: 19,
              sourceType: "video",
              sourceUrl:
                "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
              summary:
                "Assess severe features, seizure precautions, and immediate nursing interventions.",
              tags: ["Preeclampsia", "Maternal safety", "Escalation"],
              attachments: [
                {
                  title: "FHR pattern guide",
                  type: "Image",
                  url: "./assets/attachments/fhr-patterns.svg"
                }
              ]
            }
          ]
        },
        {
          id: "chapter-postpartum",
          title: "Postpartum Care",
          lessons: [
            {
              id: "lesson-postpartum-hemorrhage",
              title: "Hemorrhage First Response",
              durationMinutes: 18,
              sourceType: "video",
              sourceUrl:
                "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
              summary:
                "A first-minute response plan for postpartum hemorrhage and unstable postpartum patients.",
              tags: ["Postpartum", "Hemorrhage", "Rapid response"],
              attachments: [
                {
                  title: "FHR pattern guide",
                  type: "Image",
                  url: "./assets/attachments/fhr-patterns.svg"
                }
              ]
            },
            {
              id: "lesson-newborn-first-hour",
              title: "Newborn Priorities in the First Hour",
              durationMinutes: 13,
              sourceType: "video",
              sourceUrl:
                "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
              summary:
                "Thermoregulation, APGAR interpretation, and early transition priorities for newborn care.",
              tags: ["Newborn", "Transition", "Assessment"],
              attachments: [
                {
                  title: "FHR pattern guide",
                  type: "Image",
                  url: "./assets/attachments/fhr-patterns.svg"
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  var SEED_PROGRESS = {
    "lesson-airway-assessment": {
      ratio: 1,
      positionSeconds: 1080,
      playCount: 2,
      lastWatchedAt: "2026-04-07T09:14:00.000Z"
    },
    "lesson-abg-interpretation": {
      ratio: 0.72,
      positionSeconds: 907,
      playCount: 4,
      lastWatchedAt: "2026-04-08T12:34:00.000Z"
    },
    "lesson-acs-review": {
      ratio: 1,
      positionSeconds: 1440,
      playCount: 2,
      lastWatchedAt: "2026-04-06T08:45:00.000Z"
    },
    "lesson-arrhythmia-recognition": {
      ratio: 0.92,
      positionSeconds: 938,
      playCount: 5,
      lastWatchedAt: "2026-04-05T14:12:00.000Z"
    },
    "lesson-dose-calculations": {
      ratio: 1,
      positionSeconds: 840,
      playCount: 3,
      lastWatchedAt: "2026-04-03T17:10:00.000Z"
    },
    "lesson-anticoagulant-safety": {
      ratio: 0.48,
      positionSeconds: 461,
      playCount: 3,
      lastWatchedAt: "2026-04-08T16:06:00.000Z"
    },
    "lesson-culture-before-antibiotics": {
      ratio: 1,
      positionSeconds: 720,
      playCount: 2,
      lastWatchedAt: "2026-04-02T13:20:00.000Z"
    },
    "lesson-adverse-reactions": {
      ratio: 1,
      positionSeconds: 900,
      playCount: 2,
      lastWatchedAt: "2026-04-01T12:10:00.000Z"
    },
    "lesson-fetal-heart-patterns": {
      ratio: 0.87,
      positionSeconds: 1005,
      playCount: 4,
      lastWatchedAt: "2026-04-04T15:40:00.000Z"
    },
    "lesson-preeclampsia-escalation": {
      ratio: 1,
      positionSeconds: 1140,
      playCount: 2,
      lastWatchedAt: "2026-03-31T10:00:00.000Z"
    },
    "lesson-postpartum-hemorrhage": {
      ratio: 0.35,
      positionSeconds: 378,
      playCount: 2,
      lastWatchedAt: "2026-04-07T18:25:00.000Z"
    },
    "lesson-newborn-first-hour": {
      ratio: 1,
      positionSeconds: 780,
      playCount: 2,
      lastWatchedAt: "2026-03-30T10:00:00.000Z"
    }
  };

  var INITIAL_STUDENTS = [
    {
      id: CURRENT_USER_ID,
      name: "Lina Haddad",
      email: CURRENT_USER_EMAIL,
      plan: "6-month",
      status: "active",
      targetExamDate: "2026-07-25",
      subscriptionEndsAt: "2026-09-15",
      progressPercent: 0,
      xp: 0,
      rank: "Clinical Scholar",
      lastActiveAt: "2026-04-08T16:06:00.000Z"
    },
    {
      id: "STU-3912",
      name: "Maya Odeh",
      email: "maya.odeh@nursing-quiz.com",
      plan: "12-month",
      status: "active",
      targetExamDate: "2026-10-02",
      subscriptionEndsAt: "2027-01-03",
      progressPercent: 58,
      xp: 3240,
      rank: "Charge Nurse",
      lastActiveAt: "2026-04-08T13:18:00.000Z"
    },
    {
      id: "STU-2904",
      name: "Rana Saleh",
      email: "rana.saleh@nursing-quiz.com",
      plan: "3-month",
      status: "active",
      targetExamDate: "2026-05-30",
      subscriptionEndsAt: "2026-06-20",
      progressPercent: 81,
      xp: 4410,
      rank: "Licensure Champion",
      lastActiveAt: "2026-04-09T06:42:00.000Z"
    },
    {
      id: "STU-1108",
      name: "Yasmeen Khatib",
      email: "yasmeen.khatib@nursing-quiz.com",
      plan: "6-month",
      status: "expired",
      targetExamDate: "2026-03-10",
      subscriptionEndsAt: "2026-03-01",
      progressPercent: 37,
      xp: 2010,
      rank: "Floor Nurse",
      lastActiveAt: "2026-02-27T19:20:00.000Z"
    },
    {
      id: "STU-7740",
      name: "Noor Barghouti",
      email: "noor.barghouti@nursing-quiz.com",
      plan: "12-month",
      status: "active",
      targetExamDate: "2026-11-18",
      subscriptionEndsAt: "2027-02-01",
      progressPercent: 26,
      xp: 1490,
      rank: "Skill Builder",
      lastActiveAt: "2026-04-08T09:05:00.000Z"
    }
  ];

  function flattenLibrary(library) {
    var lessons = [];

    library.forEach(function eachSubject(subject) {
      subject.chapters.forEach(function eachChapter(chapter) {
        chapter.lessons.forEach(function eachLesson(lesson) {
          lessons.push({
            id: lesson.id,
            title: lesson.title,
            durationMinutes: lesson.durationMinutes,
            sourceType: lesson.sourceType,
            sourceUrl: lesson.sourceUrl,
            summary: lesson.summary,
            tags: lesson.tags || [],
            attachments: lesson.attachments || [],
            subjectId: subject.id,
            subjectTitle: subject.title,
            chapterId: chapter.id,
            chapterTitle: chapter.title
          });
        });
      });
    });

    return lessons;
  }

  function createSeedProgress() {
    var progress = {};
    var lessons = flattenLibrary(LIBRARY);

    lessons.forEach(function seedEach(item) {
      var durationSeconds = item.durationMinutes * 60;
      var seeded = SEED_PROGRESS[item.id] || {};
      var ratio = clamp(Number(seeded.ratio || 0), 0, 1);
      progress[item.id] = {
        durationSeconds: durationSeconds,
        watchedSeconds: Math.round(durationSeconds * ratio),
        positionSeconds: clamp(
          Number(seeded.positionSeconds || Math.round(durationSeconds * ratio)),
          0,
          durationSeconds
        ),
        playCount: Number(seeded.playCount || 0),
        lastWatchedAt: seeded.lastWatchedAt || null,
        completed: ratio >= 0.99
      };
    });

    return progress;
  }

  function createSeedAnalytics() {
    return {
      "lesson-airway-assessment": { views: 96, avgWatchMinutes: 15.6, dropOffRate: 0.12 },
      "lesson-abg-interpretation": { views: 118, avgWatchMinutes: 14.8, dropOffRate: 0.21 },
      "lesson-acs-review": { views: 74, avgWatchMinutes: 18.3, dropOffRate: 0.18 },
      "lesson-arrhythmia-recognition": { views: 123, avgWatchMinutes: 13.2, dropOffRate: 0.26 },
      "lesson-dose-calculations": { views: 89, avgWatchMinutes: 11.7, dropOffRate: 0.11 },
      "lesson-anticoagulant-safety": { views: 97, avgWatchMinutes: 9.4, dropOffRate: 0.33 },
      "lesson-culture-before-antibiotics": { views: 61, avgWatchMinutes: 9.6, dropOffRate: 0.14 },
      "lesson-adverse-reactions": { views: 67, avgWatchMinutes: 10.2, dropOffRate: 0.17 },
      "lesson-fetal-heart-patterns": { views: 132, avgWatchMinutes: 15.9, dropOffRate: 0.27 },
      "lesson-preeclampsia-escalation": { views: 101, avgWatchMinutes: 16.2, dropOffRate: 0.16 },
      "lesson-postpartum-hemorrhage": { views: 88, avgWatchMinutes: 8.8, dropOffRate: 0.41 },
      "lesson-newborn-first-hour": { views: 52, avgWatchMinutes: 10.5, dropOffRate: 0.09 }
    };
  }

  function createInitialState() {
    return {
      storageVersion: 1,
      currentUserEmail: CURRENT_USER_EMAIL,
      library: clone(LIBRARY),
      students: clone(INITIAL_STUDENTS),
      progressByUser: {},
      notesByUser: {
        "lina.haddad@nursing-quiz.com": {
          "lesson-abg-interpretation": [
            {
              id: "note-1",
              timeSeconds: 325,
              text: "Revisit compensatory patterns and memorize the opposite-vs-same shortcut.",
              createdAt: "2026-04-08T12:40:00.000Z"
            }
          ],
          "lesson-postpartum-hemorrhage": [
            {
              id: "note-2",
              timeSeconds: 210,
              text: "Fundal massage comes before waiting on additional documentation.",
              createdAt: "2026-04-07T18:31:00.000Z"
            }
          ]
        }
      },
      listsByUser: {
        "lina.haddad@nursing-quiz.com": {
          favorites: ["lesson-arrhythmia-recognition", "lesson-fetal-heart-patterns"],
          watchLater: ["lesson-abg-interpretation", "lesson-anticoagulant-safety"],
          hard: ["lesson-postpartum-hemorrhage", "lesson-anticoagulant-safety"]
        }
      },
      discussionsByLesson: {
        "lesson-abg-interpretation": [
          {
            id: "comment-1",
            parentId: null,
            authorName: "Lina Haddad",
            authorEmail: CURRENT_USER_EMAIL,
            authorRole: "student",
            text: "When both PaCO2 and HCO3 move, what is the fastest way to decide if compensation is partial or full?",
            official: false,
            pinned: false,
            createdAt: "2026-04-08T12:46:00.000Z"
          },
          {
            id: "comment-2",
            parentId: "comment-1",
            authorName: "Admin Team",
            authorEmail: ADMIN_EMAIL,
            authorRole: "admin",
            text: "Start with pH first. If the pH is still outside normal, compensation is partial. If pH normalizes while both PaCO2 and HCO3 are abnormal, think full compensation.",
            official: true,
            pinned: true,
            createdAt: "2026-04-08T13:10:00.000Z"
          }
        ],
        "lesson-postpartum-hemorrhage": [
          {
            id: "comment-3",
            parentId: null,
            authorName: "Maya Odeh",
            authorEmail: "maya.odeh@nursing-quiz.com",
            authorRole: "student",
            text: "Would you prioritize uterotonics before checking for retained placental fragments on exam questions?",
            official: false,
            pinned: false,
            createdAt: "2026-04-07T19:02:00.000Z"
          }
        ]
      },
      badgesByUser: {},
      certificatesByUser: {},
      lessonAnalytics: createSeedAnalytics()
    };
  }

  function parseStoredState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function saveState(state) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }

  function getProgressState(state, userEmail) {
    if (!state.progressByUser[userEmail]) {
      state.progressByUser[userEmail] = {};
    }

    return state.progressByUser[userEmail];
  }

  function getNotesState(state, userEmail) {
    if (!state.notesByUser[userEmail]) {
      state.notesByUser[userEmail] = {};
    }

    return state.notesByUser[userEmail];
  }

  function getListState(state, userEmail) {
    if (!state.listsByUser[userEmail]) {
      state.listsByUser[userEmail] = {
        favorites: [],
        watchLater: [],
        hard: []
      };
    }

    return state.listsByUser[userEmail];
  }

  function getDiscussionState(state, lessonId) {
    if (!state.discussionsByLesson[lessonId]) {
      state.discussionsByLesson[lessonId] = [];
    }

    return state.discussionsByLesson[lessonId];
  }

  function getBadgeState(state, userEmail) {
    if (!state.badgesByUser[userEmail]) {
      state.badgesByUser[userEmail] = [];
    }

    return state.badgesByUser[userEmail];
  }

  function loadState() {
    var stored = parseStoredState();
    var state = stored && stored.storageVersion === 1 ? stored : createInitialState();

    if (!state.progressByUser[CURRENT_USER_EMAIL]) {
      state.progressByUser[CURRENT_USER_EMAIL] = createSeedProgress();
    }

    getNotesState(state, CURRENT_USER_EMAIL);
    getListState(state, CURRENT_USER_EMAIL);
    syncAchievements(state, CURRENT_USER_EMAIL);
    syncStudentSnapshot(state, CURRENT_USER_EMAIL);
    saveState(state);

    return state;
  }

  function getCurrentUser(state) {
    return state.students.find(function findStudent(student) {
      return student.email === state.currentUserEmail;
    });
  }

  function getLessonMap(state) {
    var map = {};

    flattenLibrary(state.library).forEach(function eachLesson(lesson) {
      map[lesson.id] = lesson;
    });

    return map;
  }

  function getLesson(state, lessonId) {
    return getLessonMap(state)[lessonId] || null;
  }

  function formatMinutes(totalMinutes) {
    if (!Number.isFinite(totalMinutes)) {
      return "0 min";
    }

    if (totalMinutes >= 60) {
      return (
        Math.floor(totalMinutes / 60) +
        "h " +
        Math.round(totalMinutes % 60) +
        "m"
      );
    }

    return Math.round(totalMinutes) + " min";
  }

  function formatSeconds(totalSeconds) {
    var seconds = Math.max(0, Math.round(totalSeconds || 0));
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainder = seconds % 60;

    if (hours > 0) {
      return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainder).padStart(2, "0")
      );
    }

    return String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0");
  }

  function formatDate(dateString) {
    if (!dateString) {
      return "Not set";
    }

    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (error) {
      return dateString;
    }
  }

  function calculateUserStats(state, userEmail) {
    var lessons = flattenLibrary(state.library);
    var progressState = getProgressState(state, userEmail);
    var notesState = getNotesState(state, userEmail);
    var listsState = getListState(state, userEmail);
    var lessonsWithProgress = lessons.map(function eachLesson(lesson) {
      var progress = progressState[lesson.id] || {
        durationSeconds: lesson.durationMinutes * 60,
        watchedSeconds: 0,
        positionSeconds: 0,
        playCount: 0,
        lastWatchedAt: null,
        completed: false
      };
      var ratio = clamp(
        progress.durationSeconds ? progress.watchedSeconds / progress.durationSeconds : 0,
        0,
        1
      );

      return {
        lesson: lesson,
        progress: progress,
        completionRatio: ratio
      };
    });

    var totalDurationSeconds = sum(
      lessonsWithProgress.map(function eachItem(item) {
        return item.progress.durationSeconds;
      })
    );

    var watchedSeconds = sum(
      lessonsWithProgress.map(function eachItem(item) {
        return Math.min(item.progress.watchedSeconds, item.progress.durationSeconds);
      })
    );

    var completedLessons = lessonsWithProgress.filter(function isComplete(item) {
      return item.progress.completed || item.completionRatio >= 0.99;
    });

    var incompleteLessons = lessonsWithProgress.filter(function isIncomplete(item) {
      return !(item.progress.completed || item.completionRatio >= 0.99);
    });

    var lastResumeLesson = lessonsWithProgress
      .filter(function hasProgress(item) {
        return item.progress.positionSeconds > 0;
      })
      .sort(function sortResume(a, b) {
        return new Date(b.progress.lastWatchedAt || 0) - new Date(a.progress.lastWatchedAt || 0);
      })[0];

    var replayList = lessonsWithProgress
      .map(function eachReplay(item) {
        return {
          lessonId: item.lesson.id,
          title: item.lesson.title,
          replayCount: Math.max(0, item.progress.playCount - 1)
        };
      })
      .filter(function filterReplay(item) {
        return item.replayCount > 0;
      })
      .sort(function sortReplay(a, b) {
        return b.replayCount - a.replayCount;
      })
      .slice(0, 4);

    var subjectWatchMap = {};
    lessonsWithProgress.forEach(function eachProgress(item) {
      subjectWatchMap[item.lesson.subjectTitle] =
        (subjectWatchMap[item.lesson.subjectTitle] || 0) + item.progress.watchedSeconds;
    });

    var mostActiveSubject = Object.keys(subjectWatchMap)
      .map(function eachSubject(subjectTitle) {
        return {
          subjectTitle: subjectTitle,
          watchedSeconds: subjectWatchMap[subjectTitle]
        };
      })
      .sort(function sortSubjects(a, b) {
        return b.watchedSeconds - a.watchedSeconds;
      })[0];

    var noteCount = Object.keys(notesState).reduce(function countNotes(total, lessonId) {
      return total + notesState[lessonId].length;
    }, 0);
    var badgeCount = getBadgeState(state, userEmail).length;
    var overallPercent = totalDurationSeconds
      ? Math.round((watchedSeconds / totalDurationSeconds) * 100)
      : 0;
    var xp =
      completedLessons.length * 360 +
      noteCount * 35 +
      badgeCount * 140 +
      Math.round(overallPercent * 11.2);
    var rankTiers = [
      { minXp: 0, level: 1, label: "Skill Builder" },
      { minXp: 900, level: 2, label: "Floor Nurse" },
      { minXp: 1800, level: 3, label: "Charge Nurse" },
      { minXp: 3000, level: 4, label: "Clinical Scholar" },
      { minXp: 4400, level: 5, label: "Licensure Champion" }
    ];
    var rank = rankTiers.reduce(function findRank(current, tier) {
      return xp >= tier.minXp ? tier : current;
    }, rankTiers[0]);

    return {
      lessons: lessonsWithProgress,
      completedLessons: completedLessons,
      incompleteLessons: incompleteLessons,
      lastResumeLesson: lastResumeLesson,
      replayList: replayList,
      mostActiveSubject: mostActiveSubject,
      watchedSeconds: watchedSeconds,
      totalDurationSeconds: totalDurationSeconds,
      overallPercent: overallPercent,
      xp: xp,
      rank: rank,
      noteCount: noteCount,
      badgeCount: badgeCount,
      listsState: listsState
    };
  }

  function syncAchievements(state, userEmail) {
    var badgeState = getBadgeState(state, userEmail);
    var progressState = getProgressState(state, userEmail);
    var now = isoNow();

    state.library.forEach(function eachSubject(subject) {
      var subjectLessonIds = [];

      subject.chapters.forEach(function eachChapter(chapter) {
        var chapterLessonIds = chapter.lessons.map(function eachLesson(lesson) {
          return lesson.id;
        });
        subjectLessonIds = subjectLessonIds.concat(chapterLessonIds);

        if (
          chapterLessonIds.every(function isDone(lessonId) {
            return progressState[lessonId] && progressState[lessonId].completed;
          }) &&
          !badgeState.find(function hasBadge(badge) {
            return badge.id === "chapter-" + chapter.id;
          })
        ) {
          badgeState.push({
            id: "chapter-" + chapter.id,
            type: "Chapter",
            title: chapter.title,
            date: now,
            completionLabel: "100% complete",
            scope: subject.title
          });
        }
      });

      if (
        subjectLessonIds.length &&
        subjectLessonIds.every(function isDone(lessonId) {
          return progressState[lessonId] && progressState[lessonId].completed;
        }) &&
        !badgeState.find(function hasBadge(badge) {
          return badge.id === "subject-" + subject.id;
        })
      ) {
        badgeState.push({
          id: "subject-" + subject.id,
          type: "Subject",
          title: subject.title,
          date: now,
          completionLabel: "100% complete",
          scope: "Full subject mastered"
        });
      }
    });

    if (calculateUserStats(state, userEmail).overallPercent === 100 && !state.certificatesByUser[userEmail]) {
      state.certificatesByUser[userEmail] = {
        issuedAt: now
      };
    }
  }

  function syncStudentSnapshot(state, userEmail) {
    var student = state.students.find(function findStudent(item) {
      return item.email === userEmail;
    });

    if (!student) {
      return;
    }

    var stats = calculateUserStats(state, userEmail);
    student.progressPercent = stats.overallPercent;
    student.xp = stats.xp;
    student.rank = stats.rank.label;
    student.status =
      new Date(student.subscriptionEndsAt).getTime() >= new Date(TODAY).getTime()
        ? "active"
        : "expired";

    if (stats.lastResumeLesson && stats.lastResumeLesson.progress.lastWatchedAt) {
      student.lastActiveAt = stats.lastResumeLesson.progress.lastWatchedAt;
    }
  }

  function bumpLessonAnalytics(state, lessonId, progress) {
    var analytics = state.lessonAnalytics[lessonId] || {
      views: 0,
      avgWatchMinutes: 0,
      dropOffRate: 0
    };
    analytics.views += 1;
    analytics.avgWatchMinutes = Number(
      ((analytics.avgWatchMinutes + progress.watchedSeconds / 60) / 2).toFixed(1)
    );
    analytics.dropOffRate = Number(
      (
        1 -
        clamp(
          progress.durationSeconds ? progress.watchedSeconds / progress.durationSeconds : 0,
          0,
          1
        )
      ).toFixed(2)
    );
    state.lessonAnalytics[lessonId] = analytics;
  }

  function updateLessonProgress(state, userEmail, lessonId, partialProgress) {
    var progressState = getProgressState(state, userEmail);
    var lesson = getLesson(state, lessonId);
    var durationSeconds =
      partialProgress.durationSeconds || (lesson ? lesson.durationMinutes * 60 : 0);
    var existing = progressState[lessonId] || {
      durationSeconds: durationSeconds,
      watchedSeconds: 0,
      positionSeconds: 0,
      playCount: 0,
      lastWatchedAt: null,
      completed: false
    };

    var nextProgress = {
      durationSeconds: durationSeconds,
      watchedSeconds: Math.max(
        existing.watchedSeconds,
        Number(
          partialProgress.watchedSeconds != null
            ? partialProgress.watchedSeconds
            : existing.watchedSeconds
        )
      ),
      positionSeconds: clamp(
        Number(
          partialProgress.positionSeconds != null
            ? partialProgress.positionSeconds
            : existing.positionSeconds
        ),
        0,
        durationSeconds
      ),
      playCount: partialProgress.incrementPlayCount
        ? existing.playCount + 1
        : Number(
            partialProgress.playCount != null
              ? partialProgress.playCount
              : existing.playCount
          ),
      lastWatchedAt: partialProgress.lastWatchedAt || existing.lastWatchedAt || isoNow(),
      completed:
        partialProgress.completed === true ||
        existing.completed ||
        Math.max(
          existing.watchedSeconds,
          Number(
            partialProgress.watchedSeconds != null
              ? partialProgress.watchedSeconds
              : existing.watchedSeconds
          )
        ) >= durationSeconds * 0.985
    };

    if (nextProgress.completed) {
      nextProgress.positionSeconds = durationSeconds;
      nextProgress.watchedSeconds = durationSeconds;
    }

    progressState[lessonId] = nextProgress;
    syncAchievements(state, userEmail);
    syncStudentSnapshot(state, userEmail);
    bumpLessonAnalytics(state, lessonId, nextProgress);
    saveState(state);
    return nextProgress;
  }

  function setPlanForCurrentUser(state, plan) {
    var student = getCurrentUser(state);
    var months = { "3-month": 3, "6-month": 6, "12-month": 12 }[plan] || 6;
    var nextDate = new Date(TODAY + "T00:00:00");
    nextDate.setMonth(nextDate.getMonth() + months);
    student.plan = plan;
    student.subscriptionEndsAt = nextDate.toISOString().slice(0, 10);
    student.status = "active";
    saveState(state);
    return state;
  }

  function toggleLessonList(state, userEmail, listName, lessonId) {
    var listsState = getListState(state, userEmail);
    var list = listsState[listName];

    if (!Array.isArray(list)) {
      return false;
    }

    if (list.indexOf(lessonId) >= 0) {
      listsState[listName] = list.filter(function removeId(item) {
        return item !== lessonId;
      });
      saveState(state);
      return false;
    }

    listsState[listName].push(lessonId);
    saveState(state);
    return true;
  }

  function addNote(state, userEmail, lessonId, timeSeconds, text) {
    var notesState = getNotesState(state, userEmail);

    if (!notesState[lessonId]) {
      notesState[lessonId] = [];
    }

    notesState[lessonId].unshift({
      id: "note-" + Date.now(),
      timeSeconds: Math.max(0, Number(timeSeconds || 0)),
      text: text,
      createdAt: isoNow()
    });

    syncStudentSnapshot(state, userEmail);
    saveState(state);
  }

  function addComment(state, lessonId, payload) {
    var discussion = getDiscussionState(state, lessonId);

    discussion.push({
      id: "comment-" + Date.now(),
      parentId: payload.parentId || null,
      authorName: payload.authorName,
      authorEmail: payload.authorEmail,
      authorRole: payload.authorRole,
      text: payload.text,
      official: Boolean(payload.official),
      pinned: false,
      createdAt: isoNow()
    });

    saveState(state);
  }

  function setPinnedComment(state, lessonId, commentId) {
    var discussion = getDiscussionState(state, lessonId);
    discussion.forEach(function eachComment(comment) {
      comment.pinned = comment.id === commentId ? !comment.pinned : false;
    });
    saveState(state);
  }

  function getThreadedComments(state, lessonId) {
    var discussion = getDiscussionState(state, lessonId).slice();
    var commentsById = {};
    var roots = [];

    discussion.sort(function sortComments(a, b) {
      if (a.pinned && !b.pinned) {
        return -1;
      }
      if (!a.pinned && b.pinned) {
        return 1;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    discussion.forEach(function createNode(comment) {
      commentsById[comment.id] = Object.assign({}, comment, { replies: [] });
    });

    discussion.forEach(function attachNode(comment) {
      var node = commentsById[comment.id];
      if (comment.parentId && commentsById[comment.parentId]) {
        commentsById[comment.parentId].replies.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  function getSchedule(state, userEmail, explicitDate) {
    var targetDate = explicitDate || getCurrentUser(state).targetExamDate;
    var stats = calculateUserStats(state, userEmail);
    var incompleteLessons = stats.incompleteLessons;
    var now = new Date(TODAY + "T00:00:00");
    var target = targetDate ? new Date(targetDate + "T00:00:00") : null;
    var dayDiff = target ? Math.max(1, Math.ceil((target - now) / 86400000)) : 28;
    var weeks = Math.max(1, Math.ceil(dayDiff / 7));
    var perWeek = Math.max(1, Math.ceil(incompleteLessons.length / weeks));
    var cards = [];

    for (var index = 0; index < Math.min(4, weeks); index += 1) {
      var slice = incompleteLessons.slice(index * perWeek, index * perWeek + perWeek);
      if (!slice.length) {
        break;
      }

      cards.push({
        label: "Week " + (index + 1),
        lessonCount: slice.length,
        minutes: Math.max(
          1,
          Math.round(
            sum(
              slice.map(function eachSlice(item) {
                return (item.progress.durationSeconds - item.progress.watchedSeconds) / 60;
              })
            )
          )
        ),
        focus: slice[0].lesson.subjectTitle + " / " + slice[0].lesson.chapterTitle,
        items: slice.map(function listTitles(item) {
          return item.lesson.title;
        })
      });
    }

    return {
      targetDate: targetDate,
      weeksRemaining: weeks,
      perWeek: perWeek,
      remainingLessons: incompleteLessons.length,
      remainingMinutes: Math.max(
        0,
        Math.round(
          sum(
            incompleteLessons.map(function eachIncomplete(item) {
              return (item.progress.durationSeconds - item.progress.watchedSeconds) / 60;
            })
          )
        )
      ),
      cards: cards
    };
  }

  function parseYouTubeId(url) {
    if (!url) {
      return null;
    }

    var shortMatch = String(url).match(/youtu\.be\/([\w-]{6,})/i);
    if (shortMatch) {
      return shortMatch[1];
    }

    var longMatch = String(url).match(/[?&]v=([\w-]{6,})/i);
    if (longMatch) {
      return longMatch[1];
    }

    var embedMatch = String(url).match(/embed\/([\w-]{6,})/i);
    if (embedMatch) {
      return embedMatch[1];
    }

    return null;
  }

  function addLessonFromAdmin(state, payload) {
    var subjectId = "subject-" + slugify(payload.subjectTitle);
    var chapterId = "chapter-" + slugify(payload.chapterTitle);
    var lessonId = "lesson-" + slugify(payload.title + "-" + Date.now());
    var subject = state.library.find(function findSubject(item) {
      return item.id === subjectId;
    });

    if (!subject) {
      subject = {
        id: subjectId,
        title: payload.subjectTitle,
        chapters: []
      };
      state.library.push(subject);
    }

    var chapter = subject.chapters.find(function findChapter(item) {
      return item.id === chapterId;
    });

    if (!chapter) {
      chapter = {
        id: chapterId,
        title: payload.chapterTitle,
        lessons: []
      };
      subject.chapters.push(chapter);
    }

    chapter.lessons.push({
      id: lessonId,
      title: payload.title,
      durationMinutes: Number(payload.durationMinutes),
      sourceType: payload.sourceType,
      sourceUrl: payload.sourceUrl || "",
      summary:
        payload.summary ||
        "Newly published by the admin portal and ready for secure playback.",
      tags: payload.tags || ["New release"],
      attachments: payload.attachments || []
    });

    getProgressState(state, CURRENT_USER_EMAIL)[lessonId] = {
      durationSeconds: Number(payload.durationMinutes) * 60,
      watchedSeconds: 0,
      positionSeconds: 0,
      playCount: 0,
      lastWatchedAt: null,
      completed: false
    };

    state.lessonAnalytics[lessonId] = {
      views: 0,
      avgWatchMinutes: 0,
      dropOffRate: 0
    };

    saveState(state);
    return lessonId;
  }

  function getAdminMetrics(state) {
    var students = state.students.slice();
    var active = students.filter(function isActive(student) {
      return student.status === "active";
    });
    var expired = students.filter(function isExpired(student) {
      return student.status === "expired";
    });
    var lessons = flattenLibrary(state.library);
    var analyticsRows = lessons
      .map(function eachLesson(lesson) {
        return {
          lessonId: lesson.id,
          title: lesson.title,
          subjectTitle: lesson.subjectTitle,
          views: (state.lessonAnalytics[lesson.id] || {}).views || 0,
          avgWatchMinutes: (state.lessonAnalytics[lesson.id] || {}).avgWatchMinutes || 0,
          dropOffRate: (state.lessonAnalytics[lesson.id] || {}).dropOffRate || 0
        };
      })
      .sort(function sortRows(a, b) {
        return b.views - a.views;
      });

    return {
      activeSubscriptions: active.length,
      expiredSubscriptions: expired.length,
      planBreakdown: ["3-month", "6-month", "12-month"].map(function eachPlan(plan) {
        return {
          plan: plan,
          active: active.filter(function countActive(student) {
            return student.plan === plan;
          }).length,
          expired: expired.filter(function countExpired(student) {
            return student.plan === plan;
          }).length
        };
      }),
      topLessons: analyticsRows.slice(0, 5),
      averageWatchMinutes:
        analyticsRows.length > 0
          ? Number(
              (
                analyticsRows.reduce(function totalWatch(total, item) {
                  return total + item.avgWatchMinutes;
                }, 0) / analyticsRows.length
              ).toFixed(1)
            )
          : 0,
      averageDropOff:
        analyticsRows.length > 0
          ? Number(
              (
                analyticsRows.reduce(function totalDropOff(total, item) {
                  return total + item.dropOffRate;
                }, 0) / analyticsRows.length
              ).toFixed(2)
            )
          : 0
    };
  }

  window.NQVod = {
    STORAGE_KEY: STORAGE_KEY,
    ADMIN_EMAIL: ADMIN_EMAIL,
    ADMIN_PASSWORD: ADMIN_PASSWORD,
    CURRENT_USER_EMAIL: CURRENT_USER_EMAIL,
    CURRENT_USER_ID: CURRENT_USER_ID,
    loadState: loadState,
    saveState: saveState,
    getCurrentUser: getCurrentUser,
    getLesson: getLesson,
    getLessonMap: getLessonMap,
    flattenLibrary: function flatten(state) {
      return flattenLibrary(state.library);
    },
    getListState: getListState,
    getNotesState: getNotesState,
    getProgressState: getProgressState,
    calculateUserStats: calculateUserStats,
    updateLessonProgress: updateLessonProgress,
    toggleLessonList: toggleLessonList,
    addNote: addNote,
    addComment: addComment,
    getThreadedComments: getThreadedComments,
    setPinnedComment: setPinnedComment,
    getSchedule: getSchedule,
    parseYouTubeId: parseYouTubeId,
    formatSeconds: formatSeconds,
    formatMinutes: formatMinutes,
    formatDate: formatDate,
    setPlanForCurrentUser: setPlanForCurrentUser,
    addLessonFromAdmin: addLessonFromAdmin,
    getAdminMetrics: getAdminMetrics,
    syncStudentSnapshot: syncStudentSnapshot,
    syncAchievements: syncAchievements
  };
})(window);
