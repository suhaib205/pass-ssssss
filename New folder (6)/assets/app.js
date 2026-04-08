(function studentApp(window, document) {
  "use strict";

  var platform = window.NQVod;

  if (!platform) {
    return;
  }

  var state = platform.loadState();
  var currentUser = platform.getCurrentUser(state);
  var selectedLessonId = null;
  var activeTab = "attachments";
  var replyParentId = null;
  var playbackRate = 1;
  var currentPlayer = {
    type: "none",
    element: null,
    ytPlayer: null,
    pollTimer: null,
    lastPersistAt: 0
  };

  var dom = {
    subscriptionBanner: document.getElementById("subscriptionBanner"),
    profileCard: document.getElementById("profileCard"),
    examDateInput: document.getElementById("examDateInput"),
    plannerSummary: document.getElementById("plannerSummary"),
    plannerSchedule: document.getElementById("plannerSchedule"),
    listBuckets: document.getElementById("listBuckets"),
    progressOverview: document.getElementById("progressOverview"),
    analyticsPanel: document.getElementById("analyticsPanel"),
    rankPanel: document.getElementById("rankPanel"),
    badgePanel: document.getElementById("badgePanel"),
    certificatePanel: document.getElementById("certificatePanel"),
    libraryAccordion: document.getElementById("libraryAccordion"),
    playerTitle: document.getElementById("playerTitle"),
    playerTypeBadge: document.getElementById("playerTypeBadge"),
    resumeBadge: document.getElementById("resumeBadge"),
    playerShell: document.getElementById("playerShell"),
    playerMount: document.getElementById("playerMount"),
    speedControls: document.getElementById("speedControls"),
    lessonSummary: document.getElementById("lessonSummary"),
    lessonActions: document.getElementById("lessonActions"),
    attachmentsPanel: document.getElementById("attachmentsPanel"),
    notesForm: document.getElementById("notesForm"),
    noteTimestamp: document.getElementById("noteTimestamp"),
    noteText: document.getElementById("noteText"),
    notesList: document.getElementById("notesList"),
    discussionForm: document.getElementById("discussionForm"),
    discussionText: document.getElementById("discussionText"),
    discussionList: document.getElementById("discussionList"),
    replyParentId: document.getElementById("replyParentId"),
    replyState: document.getElementById("replyState"),
    cancelReplyButton: document.getElementById("cancelReplyButton"),
    resumeButton: document.getElementById("resumeButton"),
    markCompleteButton: document.getElementById("markCompleteButton"),
    watermarkOne: document.getElementById("watermarkOne"),
    watermarkTwo: document.getElementById("watermarkTwo"),
    watermarkThree: document.getElementById("watermarkThree"),
    captureTimestampButton: document.getElementById("captureTimestampButton")
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function refreshState() {
    state = platform.loadState();
    currentUser = platform.getCurrentUser(state);
  }

  function getSelectedLesson() {
    return selectedLessonId ? platform.getLesson(state, selectedLessonId) : null;
  }

  function getSelectedProgress() {
    return platform.getProgressState(state, currentUser.email)[selectedLessonId];
  }

  function getCurrentTimeSeconds() {
    if (currentPlayer.type === "video" && currentPlayer.element) {
      return currentPlayer.element.currentTime || 0;
    }

    if (currentPlayer.type === "youtube" && currentPlayer.ytPlayer && currentPlayer.ytPlayer.getCurrentTime) {
      try {
        return currentPlayer.ytPlayer.getCurrentTime() || 0;
      } catch (error) {
        return 0;
      }
    }

    return getSelectedProgress() ? getSelectedProgress().positionSeconds : 0;
  }

  function seekTo(seconds) {
    var target = Math.max(0, Number(seconds || 0));

    if (currentPlayer.type === "video" && currentPlayer.element) {
      currentPlayer.element.currentTime = target;
      return;
    }

    if (currentPlayer.type === "youtube" && currentPlayer.ytPlayer && currentPlayer.ytPlayer.seekTo) {
      currentPlayer.ytPlayer.seekTo(target, true);
    }
  }

  function setPlaybackRate(rate) {
    playbackRate = rate;

    if (currentPlayer.type === "video" && currentPlayer.element) {
      currentPlayer.element.playbackRate = rate;
    }

    if (currentPlayer.type === "youtube" && currentPlayer.ytPlayer && currentPlayer.ytPlayer.setPlaybackRate) {
      try {
        currentPlayer.ytPlayer.setPlaybackRate(rate);
      } catch (error) {
        window.console.warn("Could not set YouTube playback rate", error);
      }
    }

    renderSpeedControls();
  }

  function persistPlayback(partial) {
    var progress = getSelectedProgress();
    if (!selectedLessonId || !progress) {
      return;
    }

    platform.updateLessonProgress(
      state,
      currentUser.email,
      selectedLessonId,
      Object.assign(
        {
          durationSeconds: progress.durationSeconds,
          lastWatchedAt: new Date().toISOString()
        },
        partial
      )
    );
    refreshState();
    renderDashboard();
    renderPlanner();
    renderLists();
    renderLibrary(false);
    renderLessonMeta();
    renderWatermarks();
  }

  function clearReplyState() {
    replyParentId = null;
    dom.replyParentId.value = "";
    dom.replyState.textContent = "";
  }

  function ensureSelectedLesson() {
    if (selectedLessonId && platform.getLesson(state, selectedLessonId)) {
      return;
    }

    var stats = platform.calculateUserStats(state, currentUser.email);
    if (stats.lastResumeLesson) {
      selectedLessonId = stats.lastResumeLesson.lesson.id;
      return;
    }

    var firstLesson = platform.flattenLibrary(state)[0];
    selectedLessonId = firstLesson ? firstLesson.id : null;
  }

  function renderSubscriptionBanner() {
    dom.subscriptionBanner.innerHTML =
      '<div><strong>' +
      escapeHtml(currentUser.plan.replace("-", " ")) +
      " subscription</strong><p class=\"panel__hint\">Access active until " +
      escapeHtml(platform.formatDate(currentUser.subscriptionEndsAt)) +
      "</p></div>" +
      '<a class="btn btn--ghost" href="https://nursing-quiz.com/" target="_blank" rel="noreferrer">Open question bank</a>';
  }

  function renderProfile() {
    var stats = platform.calculateUserStats(state, currentUser.email);
    dom.profileCard.innerHTML =
      '<span class="identity-chip">Learner ID ' +
      escapeHtml(platform.CURRENT_USER_ID) +
      "</span>" +
      "<div>" +
      '<h3 class="profile-card__name">' +
      escapeHtml(currentUser.name) +
      "</h3>" +
      '<p class="panel__hint">' +
      escapeHtml(currentUser.email) +
      "</p>" +
      "</div>" +
      '<div class="profile-meta">' +
      '<div class="profile-meta__row"><span class="label-text">Current plan</span><strong>' +
      escapeHtml(currentUser.plan.replace("-", " ")) +
      "</strong></div>" +
      '<div class="profile-meta__row"><span class="label-text">Course completion</span><strong>' +
      escapeHtml(String(stats.overallPercent)) +
      "%</strong></div>" +
      '<div class="profile-meta__row"><span class="label-text">Rank and level</span><strong>' +
      escapeHtml(stats.rank.label) +
      " / L" +
      escapeHtml(String(stats.rank.level)) +
      "</strong></div>" +
      '<div class="profile-meta__row"><span class="label-text">Last active</span><strong>' +
      escapeHtml(platform.formatDate(currentUser.lastActiveAt)) +
      "</strong></div>" +
      "</div>";
  }

  function renderPlanner() {
    var schedule = platform.getSchedule(state, currentUser.email, currentUser.targetExamDate);
    dom.examDateInput.value = currentUser.targetExamDate || "";
    dom.plannerSummary.innerHTML =
      '<strong>' +
      escapeHtml(String(schedule.remainingLessons)) +
      " lessons left</strong>" +
      '<span class="panel__hint">' +
      escapeHtml(String(schedule.weeksRemaining)) +
      " weeks until exam, about " +
      escapeHtml(String(schedule.perWeek)) +
      " lesson(s) weekly and " +
      escapeHtml(platform.formatMinutes(schedule.remainingMinutes)) +
      " remaining.</span>";

    if (!schedule.cards.length) {
      dom.plannerSchedule.innerHTML =
        '<div class="schedule-item"><strong>Schedule unlocked</strong><span class="panel__hint">You have completed every available lesson.</span></div>';
      return;
    }

    dom.plannerSchedule.innerHTML = schedule.cards
      .map(function eachCard(card) {
        return (
          '<article class="schedule-item">' +
          "<strong>" +
          escapeHtml(card.label) +
          "</strong>" +
          '<span class="panel__hint">' +
          escapeHtml(card.focus) +
          "</span>" +
          "<span>" +
          escapeHtml(String(card.lessonCount)) +
          " lessons / " +
          escapeHtml(platform.formatMinutes(card.minutes)) +
          "</span>" +
          '<span class="panel__hint">' +
          escapeHtml(card.items.join(" • ")) +
          "</span>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderLists() {
    var listsState = platform.getListState(state, currentUser.email);
    var lessonMap = platform.getLessonMap(state);
    var buckets = [
      { key: "favorites", label: "Favorites" },
      { key: "watchLater", label: "Watch later" },
      { key: "hard", label: "Hard / review again" }
    ];

    dom.listBuckets.innerHTML = buckets
      .map(function eachBucket(bucket) {
        var items = listsState[bucket.key] || [];
        return (
          '<article class="list-bucket">' +
          "<strong>" +
          escapeHtml(bucket.label) +
          "</strong>" +
          '<span class="panel__hint">' +
          escapeHtml(String(items.length)) +
          " saved lesson(s)</span>" +
          (items.length
            ? items
                .slice(0, 4)
                .map(function eachItem(id) {
                  var lesson = lessonMap[id];
                  return (
                    '<button class="comment-action" type="button" data-open-lesson="' +
                    escapeHtml(id) +
                    '">' +
                    escapeHtml(lesson ? lesson.title : id) +
                    "</button>"
                  );
                })
                .join("")
            : '<span class="panel__hint">No lessons saved here yet.</span>') +
          "</article>"
        );
      })
      .join("");
  }

  function renderDashboard() {
    var stats = platform.calculateUserStats(state, currentUser.email);
    var percent = stats.overallPercent;
    var badges = (state.badgesByUser[currentUser.email] || []).slice().sort(function sortBadges(a, b) {
      return new Date(b.date) - new Date(a.date);
    });
    var certificate = state.certificatesByUser[currentUser.email];

    dom.progressOverview.innerHTML =
      '<div class="progress-card">' +
      '<div class="progress-ring" style="--percent:' +
      escapeHtml(String(percent)) +
      '%">' +
      escapeHtml(String(percent)) +
      "%</div>" +
      '<div class="certificate-card__status">' +
      "<strong>Overall course progress</strong>" +
      '<span class="panel__hint">' +
      escapeHtml(String(stats.completedLessons.length)) +
      " of " +
      escapeHtml(String(stats.lessons.length)) +
      " lessons completed.</span>" +
      '<div class="progress-bar"><span style="width:' +
      escapeHtml(String(percent)) +
      '%"></span></div>' +
      "</div>" +
      "</div>";

    dom.analyticsPanel.innerHTML =
      '<div class="panel__header"><h3>Smart analytics</h3><span class="panel__hint">Exactly where your study momentum is right now</span></div>' +
      '<div class="summary-grid">' +
      '<article class="mini-stat"><span class="value-caption">Resume from exact minute</span><strong>' +
      escapeHtml(
        stats.lastResumeLesson
          ? stats.lastResumeLesson.lesson.title + " @ " + platform.formatSeconds(stats.lastResumeLesson.progress.positionSeconds)
          : "No playback yet"
      ) +
      "</strong></article>" +
      '<article class="mini-stat"><span class="value-caption">Most active subject</span><strong>' +
      escapeHtml(stats.mostActiveSubject ? stats.mostActiveSubject.subjectTitle : "No data") +
      "</strong></article>" +
      '<article class="mini-stat"><span class="value-caption">Incomplete videos</span><strong>' +
      escapeHtml(String(stats.incompleteLessons.length)) +
      "</strong></article>" +
      '<article class="mini-stat"><span class="value-caption">Private notes saved</span><strong>' +
      escapeHtml(String(stats.noteCount)) +
      "</strong></article>" +
      "</div>" +
      (stats.replayList.length
        ? '<div class="analytics-card"><strong>Replay count per video</strong><div class="tag-group">' +
          stats.replayList
            .map(function eachReplay(item) {
              return '<span class="tag">' + escapeHtml(item.title) + " x" + escapeHtml(String(item.replayCount)) + "</span>";
            })
            .join("") +
          "</div></div>"
        : "") +
      (stats.incompleteLessons.length
        ? '<div class="analytics-card"><strong>Incomplete queue</strong><div class="tag-group">' +
          stats.incompleteLessons
            .slice(0, 6)
            .map(function eachIncomplete(item) {
              return '<span class="tag">' + escapeHtml(item.lesson.title) + "</span>";
            })
            .join("") +
          "</div></div>"
        : "");

    dom.rankPanel.innerHTML =
      '<div class="panel__header"><h3>Gamification and level</h3><span class="panel__hint">Progress-driven motivation across the full track</span></div>' +
      '<div class="rank-card__header">' +
      '<span class="rank-chip">' +
      escapeHtml(stats.rank.label) +
      " / Level " +
      escapeHtml(String(stats.rank.level)) +
      "</span>" +
      '<strong class="big-number">' +
      escapeHtml(String(stats.xp)) +
      " XP</strong>" +
      '<span class="panel__hint">' +
      escapeHtml(String(stats.badgeCount)) +
      " micro-credentials unlocked so far.</span>" +
      "</div>";

    dom.badgePanel.innerHTML =
      '<div class="panel__header"><h3>Completion badges</h3><span class="panel__hint">Issued automatically when chapters and subjects hit 100%</span></div>' +
      '<div class="badge-grid">' +
      (badges.length
        ? badges
            .map(function eachBadge(badge) {
              return (
                '<article class="badge-card">' +
                '<span class="pill pill--subtle">' +
                escapeHtml(badge.type) +
                "</span>" +
                "<strong>" +
                escapeHtml(badge.title) +
                "</strong>" +
                '<span class="panel__hint">' +
                escapeHtml(badge.scope) +
                "</span>" +
                '<span class="panel__hint">' +
                escapeHtml(badge.completionLabel + " on " + platform.formatDate(badge.date)) +
                "</span>" +
                "</article>"
              );
            })
            .join("")
        : '<article class="badge-card"><strong>No badges yet</strong><span class="panel__hint">Finish any full chapter to unlock your first micro-credential.</span></article>') +
      "</div>";

    dom.certificatePanel.innerHTML =
      '<div class="panel__header"><h3>Certificate of completion</h3><span class="panel__hint">Unlocks when the overall course reaches 100%</span></div>' +
      '<article class="certificate-card">' +
      "<strong>Branded course certificate</strong>" +
      '<span class="panel__hint">' +
      (certificate
        ? "Issued on " + escapeHtml(platform.formatDate(certificate.issuedAt))
        : "Complete every lesson to unlock your downloadable certificate.") +
      "</span>" +
      '<button class="btn ' +
      (certificate ? "btn--primary" : "btn--ghost") +
      '" id="downloadCertificateButton" type="button" ' +
      (certificate ? "" : "disabled") +
      ">Download certificate</button>" +
      "</article>";
  }

  function renderLibrary(rebuild) {
    var stats = platform.calculateUserStats(state, currentUser.email);
    var lessonProgress = {};
    stats.lessons.forEach(function eachItem(item) {
      lessonProgress[item.lesson.id] = item;
    });

    if (rebuild !== false) {
      dom.libraryAccordion.innerHTML = state.library
        .map(function eachSubject(subject) {
          var subjectLessonItems = [];
          subject.chapters.forEach(function eachChapterForStatus(chapter) {
            chapter.lessons.forEach(function eachLessonForStatus(lesson) {
              if (lessonProgress[lesson.id]) {
                subjectLessonItems.push(lessonProgress[lesson.id]);
              }
            });
          });
          var subjectDone = subjectLessonItems.every(function done(item) {
            return item.progress.completed;
          });

          return (
            '<details class="subject-accordion" ' +
            (subject.chapters.some(function hasSelected(chapter) {
              return chapter.lessons.some(function lessonMatch(lesson) {
                return lesson.id === selectedLessonId;
              });
            })
              ? "open"
              : "") +
            ">" +
            "<summary>" +
            '<div class="subject-meta"><span>' +
            escapeHtml(subject.title) +
            "</span><span>" +
            ((function subjectStatus() {
              var chapterCount = subject.chapters.length;
              return subjectDone ? "Completed" : chapterCount + " chapters";
            })()) +
            "</span></div>" +
            "</summary>" +
            subject.chapters
              .map(function eachChapter(chapter) {
                return (
                  '<details class="chapter-accordion" ' +
                  (chapter.lessons.some(function lessonMatch(lesson) {
                    return lesson.id === selectedLessonId;
                  })
                    ? "open"
                    : "") +
                  ">" +
                  "<summary>" +
                  '<div class="chapter-meta"><span>' +
                  escapeHtml(chapter.title) +
                  "</span><span>" +
                  escapeHtml(String(chapter.lessons.length)) +
                  " lessons</span></div></summary>" +
                  '<div class="chapter-body">' +
                  chapter.lessons
                    .map(function eachLesson(lesson) {
                      var progress = lessonProgress[lesson.id];
                      var completion = progress
                        ? Math.round(progress.completionRatio * 100)
                        : 0;
                      return (
                        '<button class="lesson-button ' +
                        (lesson.id === selectedLessonId ? "is-selected" : "") +
                        '" type="button" data-lesson-id="' +
                        escapeHtml(lesson.id) +
                        '">' +
                        '<span class="lesson-button__title">' +
                        escapeHtml(lesson.title) +
                        "</span>" +
                        '<span class="lesson-button__meta"><span>' +
                        escapeHtml(lesson.durationMinutes + " min") +
                        "</span><span>" +
                        escapeHtml(String(completion)) +
                        "% complete</span></span></button>"
                      );
                    })
                    .join("") +
                  "</div></details>"
                );
              })
              .join("") +
            "</details>"
          );
        })
        .join("");
    } else {
      dom.libraryAccordion
        .querySelectorAll(".lesson-button")
        .forEach(function eachButton(button) {
          button.classList.toggle("is-selected", button.dataset.lessonId === selectedLessonId);
      });
    }
  }

  function renderSpeedControls() {
    var rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    dom.speedControls.innerHTML = rates
      .map(function eachRate(rate) {
        return (
          '<button class="speed-chip ' +
          (rate === playbackRate ? "is-active" : "") +
          '" type="button" data-speed="' +
          escapeHtml(String(rate)) +
          '">' +
          escapeHtml(rate + "x") +
          "</button>"
        );
      })
      .join("");
  }

  function renderWatermarks() {
    var timestamp = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    var label = currentUser.email + " | " + platform.CURRENT_USER_ID + " | " + timestamp;
    dom.watermarkOne.textContent = label;
    dom.watermarkTwo.textContent = label;
    dom.watermarkThree.textContent = label;
  }

  function destroyCurrentPlayer() {
    if (currentPlayer.pollTimer) {
      window.clearInterval(currentPlayer.pollTimer);
    }

    if (currentPlayer.ytPlayer && currentPlayer.ytPlayer.destroy) {
      currentPlayer.ytPlayer.destroy();
    }

    currentPlayer = {
      type: "none",
      element: null,
      ytPlayer: null,
      pollTimer: null,
      lastPersistAt: 0
    };
  }

  function ensureYouTubeApi() {
    if (window.YT && window.YT.Player) {
      return Promise.resolve(window.YT);
    }

    if (window.__nqYoutubePromise) {
      return window.__nqYoutubePromise;
    }

    window.__nqYoutubePromise = new Promise(function resolvePromise(resolve) {
      window.onYouTubeIframeAPIReady = function onReady() {
        resolve(window.YT);
      };
      var script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    });

    return window.__nqYoutubePromise;
  }

  function attachVideoPlayer(lesson, progress) {
    var video = document.createElement("video");
    video.controls = true;
    video.disablePictureInPicture = true;
    video.controlsList = "nodownload noplaybackrate nofullscreen";
    video.preload = "metadata";
    video.src = lesson.sourceUrl;
    video.playsInline = true;
    video.playbackRate = playbackRate;

    video.addEventListener("loadedmetadata", function onLoaded() {
      if (progress.positionSeconds) {
        video.currentTime = progress.positionSeconds;
      }
    });

    video.addEventListener("play", function onPlay() {
      persistPlayback({ incrementPlayCount: true, positionSeconds: video.currentTime });
    });

    video.addEventListener("timeupdate", function onTimeUpdate() {
      var now = Date.now();
      if (now - currentPlayer.lastPersistAt > 4000) {
        currentPlayer.lastPersistAt = now;
        persistPlayback({
          watchedSeconds: Math.round(video.currentTime),
          positionSeconds: Math.round(video.currentTime)
        });
      }
    });

    video.addEventListener("pause", function onPause() {
      persistPlayback({
        watchedSeconds: Math.round(video.currentTime),
        positionSeconds: Math.round(video.currentTime)
      });
    });

    video.addEventListener("ended", function onEnded() {
      persistPlayback({
        watchedSeconds: progress.durationSeconds,
        positionSeconds: progress.durationSeconds,
        completed: true
      });
    });

    dom.playerMount.innerHTML = "";
    dom.playerMount.appendChild(video);
    currentPlayer.type = "video";
    currentPlayer.element = video;
  }

  function attachYouTubePlayer(lesson, progress) {
    var youtubeId = platform.parseYouTubeId(lesson.sourceUrl);
    dom.playerMount.innerHTML = '<div id="youtubePlayerHost" class="player-mount"></div>';

    ensureYouTubeApi().then(function onReady(YT) {
      currentPlayer.type = "youtube";
      currentPlayer.ytPlayer = new YT.Player("youtubePlayerHost", {
        videoId: youtubeId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: 1,
          fs: 0,
          iv_load_policy: 3,
          disablekb: 1
        },
        events: {
          onReady: function onPlayerReady(event) {
            if (progress.positionSeconds) {
              event.target.seekTo(progress.positionSeconds, true);
            }
            try {
              event.target.setPlaybackRate(playbackRate);
            } catch (error) {
              window.console.warn("Could not set initial playback rate", error);
            }
          },
          onStateChange: function onStateChange(event) {
            if (event.data === YT.PlayerState.PLAYING) {
              persistPlayback({
                incrementPlayCount: true,
                positionSeconds: Math.round(event.target.getCurrentTime() || 0)
              });

              currentPlayer.pollTimer = window.setInterval(function pollYouTube() {
                try {
                  persistPlayback({
                    watchedSeconds: Math.round(event.target.getCurrentTime() || 0),
                    positionSeconds: Math.round(event.target.getCurrentTime() || 0)
                  });
                } catch (error) {
                  window.clearInterval(currentPlayer.pollTimer);
                }
              }, 5000);
            } else {
              if (currentPlayer.pollTimer) {
                window.clearInterval(currentPlayer.pollTimer);
              }

              if (event.data === YT.PlayerState.ENDED) {
                persistPlayback({
                  watchedSeconds: progress.durationSeconds,
                  positionSeconds: progress.durationSeconds,
                  completed: true
                });
              }
            }
          }
        }
      });
    });
  }

  function renderPlayer() {
    var lesson = getSelectedLesson();
    var progress = getSelectedProgress();

    destroyCurrentPlayer();

    if (!lesson || !progress) {
      dom.playerMount.innerHTML =
        '<div class="player-placeholder"><div class="player-placeholder__content"><strong>No lesson selected</strong><span class="panel__hint">Choose a lesson from the accordion library to begin.</span></div></div>';
      return;
    }

    if (lesson.sourceType === "youtube") {
      attachYouTubePlayer(lesson, progress);
      return;
    }

    if (lesson.sourceUrl) {
      attachVideoPlayer(lesson, progress);
      return;
    }

    dom.playerMount.innerHTML =
      '<div class="player-placeholder"><div class="player-placeholder__content"><strong>Upload staged</strong><span class="panel__hint">This lesson was created from a direct file upload in the static prototype and is awaiting a persistent backend media store.</span></div></div>';
  }

  function renderLessonMeta() {
    var lesson = getSelectedLesson();
    var progress = getSelectedProgress();
    var listsState = platform.getListState(state, currentUser.email);

    if (!lesson || !progress) {
      return;
    }

    dom.playerTitle.textContent = lesson.title;
    dom.playerTypeBadge.textContent =
      lesson.sourceType === "youtube" ? "YouTube secure wrapper" : "Protected VOD";
    dom.resumeBadge.textContent =
      progress.positionSeconds > 0
        ? "Resume at " + platform.formatSeconds(progress.positionSeconds)
        : "Start from beginning";

    dom.lessonSummary.innerHTML =
      '<div class="summary-grid">' +
      '<article class="mini-stat"><span class="value-caption">Subject</span><strong>' +
      escapeHtml(lesson.subjectTitle) +
      "</strong></article>" +
      '<article class="mini-stat"><span class="value-caption">Chapter</span><strong>' +
      escapeHtml(lesson.chapterTitle) +
      "</strong></article>" +
      '<article class="mini-stat"><span class="value-caption">Completion</span><strong>' +
      escapeHtml(String(Math.round((progress.watchedSeconds / progress.durationSeconds) * 100 || 0))) +
      "%</strong></article>" +
      '<article class="mini-stat"><span class="value-caption">Replay count</span><strong>' +
      escapeHtml(String(Math.max(0, progress.playCount - 1))) +
      "</strong></article>" +
      "</div>" +
      '<div class="analytics-card"><strong>Lesson summary</strong><span class="panel__hint">' +
      escapeHtml(lesson.summary) +
      '</span><div class="tag-group">' +
      lesson.tags
        .map(function eachTag(tag) {
          return '<span class="tag">' + escapeHtml(tag) + "</span>";
        })
        .join("") +
      "</div></div>";

    dom.lessonActions.innerHTML =
      '<button class="btn ' +
      (listsState.favorites.indexOf(lesson.id) >= 0 ? "btn--primary" : "btn--ghost") +
      '" type="button" data-list-toggle="favorites">Favorite</button>' +
      '<button class="btn ' +
      (listsState.watchLater.indexOf(lesson.id) >= 0 ? "btn--primary" : "btn--ghost") +
      '" type="button" data-list-toggle="watchLater">Watch later</button>' +
      '<button class="btn ' +
      (listsState.hard.indexOf(lesson.id) >= 0 ? "btn--primary" : "btn--ghost") +
      '" type="button" data-list-toggle="hard">Hard / review again</button>';

    renderAttachments();
    renderNotes();
    renderDiscussion();
  }

  function renderAttachments() {
    var lesson = getSelectedLesson();
    if (!lesson) {
      return;
    }

    dom.attachmentsPanel.innerHTML = lesson.attachments.length
      ? lesson.attachments
          .map(function eachAttachment(attachment) {
            return (
              '<article class="attachment-card">' +
              "<strong>" +
              escapeHtml(attachment.title) +
              "</strong>" +
              '<div class="attachment-card__footer"><span>' +
              escapeHtml(attachment.type) +
              '</span><a class="btn btn--ghost" href="' +
              escapeHtml(attachment.url) +
              '" download>Download</a></div></article>'
            );
          })
          .join("")
      : '<article class="attachment-card"><strong>No downloads attached</strong><span class="panel__hint">Admin materials for this lesson will appear here.</span></article>';
  }

  function renderNotes() {
    var lesson = getSelectedLesson();
    if (!lesson) {
      return;
    }

    var notes = platform.getNotesState(state, currentUser.email)[lesson.id] || [];
    dom.noteTimestamp.value = platform.formatSeconds(getCurrentTimeSeconds());
    dom.notesList.innerHTML = notes.length
      ? notes
          .map(function eachNote(note) {
            return (
              '<article class="note-card"><div class="note-card__time">' +
              escapeHtml(platform.formatSeconds(note.timeSeconds)) +
              " • " +
              escapeHtml(platform.formatDate(note.createdAt)) +
              "</div><div>" +
              escapeHtml(note.text) +
              "</div></article>"
            );
          })
          .join("")
      : '<article class="note-card"><strong>No notes yet</strong><span class="panel__hint">Capture a timestamp and save a private note for revision.</span></article>';
  }

  function renderCommentNode(node, isReply) {
    return (
      '<article class="discussion-item ' +
      (node.authorRole === "admin" ? "discussion-item--admin " : "") +
      (node.pinned ? "discussion-item--pinned " : "") +
      (isReply ? "discussion-item--reply" : "") +
      '">' +
      '<div class="discussion-item__meta"><strong>' +
      escapeHtml(node.authorName) +
      "</strong><span>" +
      escapeHtml(platform.formatDate(node.createdAt)) +
      "</span></div>" +
      '<div class="tag-group">' +
      (node.authorRole === "admin" ? '<span class="tag tag--accent">Official answer</span>' : "") +
      (node.pinned ? '<span class="tag tag--warning">Pinned</span>' : "") +
      "</div>" +
      '<div class="discussion-item__body">' +
      escapeHtml(node.text) +
      "</div>" +
      '<div class="discussion-item__actions"><button class="comment-action" type="button" data-reply-to="' +
      escapeHtml(node.id) +
      '">Reply</button></div>' +
      (node.replies.length
        ? '<div class="discussion-thread">' +
          node.replies
            .map(function eachReply(reply) {
              return renderCommentNode(reply, true);
            })
            .join("") +
          "</div>"
        : "") +
      "</article>"
    );
  }

  function renderDiscussion() {
    var lesson = getSelectedLesson();
    if (!lesson) {
      return;
    }

    var threads = platform.getThreadedComments(state, lesson.id);
    dom.discussionList.innerHTML = threads.length
      ? threads
          .map(function eachThread(thread) {
            return renderCommentNode(thread, false);
          })
          .join("")
      : '<article class="discussion-item"><strong>No questions yet</strong><span class="panel__hint">Start the first thread for this lesson.</span></article>';
  }

  function renderLessonExperience(includePlayer) {
    if (includePlayer !== false) {
      renderPlayer();
    }
    renderSpeedControls();
    renderWatermarks();
    renderLessonMeta();
  }

  function switchTab(tabName) {
    activeTab = tabName;
    document.querySelectorAll(".tab-button").forEach(function eachButton(button) {
      button.classList.toggle("is-active", button.dataset.tab === tabName);
    });
    document.querySelectorAll(".tab-panel").forEach(function eachPanel(panel) {
      panel.classList.toggle("is-active", panel.dataset.panel === tabName);
    });
  }

  function downloadCertificate() {
    var certificate = state.certificatesByUser[currentUser.email];
    if (!certificate) {
      return;
    }

    var canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1100;
    var context = canvas.getContext("2d");

    context.fillStyle = "#08111f";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = "#42a5f5";
    context.lineWidth = 8;
    context.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);

    context.fillStyle = "#ffffff";
    context.font = "700 78px 'Plus Jakarta Sans', Arial";
    context.fillText("Certificate of Completion", 230, 250);

    context.fillStyle = "#94a3b8";
    context.font = "600 34px 'Plus Jakarta Sans', Arial";
    context.fillText("Nursing Quiz VOD licensure prep program", 230, 325);

    context.fillStyle = "#42a5f5";
    context.font = "700 64px 'Plus Jakarta Sans', Arial";
    context.fillText(currentUser.name, 230, 480);

    context.fillStyle = "#ffffff";
    context.font = "500 30px 'Plus Jakarta Sans', Arial";
    context.fillText("has successfully completed every lesson in the secure VOD program.", 230, 560);
    context.fillText("Issued: " + platform.formatDate(certificate.issuedAt), 230, 640);
    context.fillText("Learner ID: " + platform.CURRENT_USER_ID, 230, 700);

    context.fillStyle = "#4ade80";
    context.font = "700 30px 'Plus Jakarta Sans', Arial";
    context.fillText("Verified by Nursing Quiz VOD", 230, 790);

    var link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "nursing-quiz-vod-certificate.png";
    link.click();
  }

  function renderAll(options) {
    refreshState();
    ensureSelectedLesson();
    renderSubscriptionBanner();
    renderProfile();
    renderPlanner();
    renderLists();
    renderDashboard();
    renderLibrary(options && options.rebuildLibrary !== false);
    renderLessonExperience(options && options.includePlayer !== false);
  }

  function handlePricingSelection(event) {
    var button = event.target.closest(".js-select-plan");
    if (!button) {
      return;
    }

    platform.setPlanForCurrentUser(state, button.dataset.plan);
    renderAll({ includePlayer: false });
    document.getElementById("student-hub").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleLibraryClick(event) {
    var lessonButton = event.target.closest("[data-lesson-id]");
    if (lessonButton) {
      selectedLessonId = lessonButton.dataset.lessonId;
      clearReplyState();
      renderAll({ includePlayer: true });
      return;
    }

    var listLink = event.target.closest("[data-open-lesson]");
    if (listLink) {
      selectedLessonId = listLink.dataset.openLesson;
      renderAll({ includePlayer: true });
    }
  }

  function handleLessonActions(event) {
    var toggle = event.target.closest("[data-list-toggle]");
    if (toggle) {
      platform.toggleLessonList(state, currentUser.email, toggle.dataset.listToggle, selectedLessonId);
      renderLists();
      renderLessonMeta();
      return;
    }

    var openLesson = event.target.closest("[data-open-lesson]");
    if (openLesson) {
      selectedLessonId = openLesson.dataset.openLesson;
      renderAll({ includePlayer: true });
    }
  }

  function handleDiscussionClick(event) {
    var replyButton = event.target.closest("[data-reply-to]");
    if (!replyButton) {
      return;
    }

    replyParentId = replyButton.dataset.replyTo;
    dom.replyParentId.value = replyParentId;
    dom.replyState.textContent = "Replying inside this thread.";
    dom.discussionText.focus();
  }

  function attachEvents() {
    document.addEventListener("click", handlePricingSelection);
    dom.libraryAccordion.addEventListener("click", handleLibraryClick);
    dom.listBuckets.addEventListener("click", handleLibraryClick);
    dom.lessonActions.addEventListener("click", handleLessonActions);
    dom.discussionList.addEventListener("click", handleDiscussionClick);
    dom.playerShell.addEventListener("contextmenu", function preventMenu(event) {
      event.preventDefault();
    });

    document.querySelectorAll(".tab-button").forEach(function eachButton(button) {
      button.addEventListener("click", function onClick() {
        switchTab(button.dataset.tab);
      });
    });

    dom.examDateInput.addEventListener("change", function onChange() {
      currentUser.targetExamDate = dom.examDateInput.value;
      platform.saveState(state);
      renderPlanner();
      renderProfile();
    });

    dom.captureTimestampButton.addEventListener("click", function onCapture() {
      dom.noteTimestamp.value = platform.formatSeconds(getCurrentTimeSeconds());
    });

    dom.notesForm.addEventListener("submit", function onSubmit(event) {
      event.preventDefault();
      if (!selectedLessonId || !dom.noteText.value.trim()) {
        return;
      }
      platform.addNote(
        state,
        currentUser.email,
        selectedLessonId,
        getCurrentTimeSeconds(),
        dom.noteText.value.trim()
      );
      dom.noteText.value = "";
      refreshState();
      renderDashboard();
      renderNotes();
    });

    dom.discussionForm.addEventListener("submit", function onSubmit(event) {
      event.preventDefault();
      if (!selectedLessonId || !dom.discussionText.value.trim()) {
        return;
      }
      platform.addComment(state, selectedLessonId, {
        parentId: replyParentId,
        authorName: currentUser.name,
        authorEmail: currentUser.email,
        authorRole: "student",
        text: dom.discussionText.value.trim(),
        official: false
      });
      dom.discussionText.value = "";
      clearReplyState();
      refreshState();
      renderDiscussion();
    });

    dom.cancelReplyButton.addEventListener("click", clearReplyState);

    dom.resumeButton.addEventListener("click", function onResume() {
      var progress = getSelectedProgress();
      if (progress) {
        seekTo(progress.positionSeconds);
      }
    });

    dom.markCompleteButton.addEventListener("click", function onComplete() {
      var progress = getSelectedProgress();
      if (!progress) {
        return;
      }
      persistPlayback({
        watchedSeconds: progress.durationSeconds,
        positionSeconds: progress.durationSeconds,
        completed: true
      });
      renderAll({ includePlayer: false, rebuildLibrary: true });
    });

    dom.speedControls.addEventListener("click", function onSpeedClick(event) {
      var button = event.target.closest("[data-speed]");
      if (!button) {
        return;
      }
      setPlaybackRate(Number(button.dataset.speed));
    });

    dom.certificatePanel.addEventListener("click", function onCertificateClick(event) {
      if (event.target.id === "downloadCertificateButton") {
        downloadCertificate();
      }
    });

    window.addEventListener("storage", function onStorage(storageEvent) {
      if (storageEvent.key === platform.STORAGE_KEY) {
        renderAll({ includePlayer: false, rebuildLibrary: true });
      }
    });
  }

  attachEvents();
  switchTab(activeTab);
  renderAll({ includePlayer: true, rebuildLibrary: true });
})(window, document);
