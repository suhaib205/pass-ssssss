(function adminApp(window, document) {
  "use strict";

  var platform = window.NQVod;

  if (!platform) {
    return;
  }

  var state = platform.loadState();
  var authKey = "nq-vod-admin-auth";
  var replyParentId = null;

  var dom = {
    loginCard: document.getElementById("adminLoginCard"),
    adminApp: document.getElementById("adminApp"),
    loginForm: document.getElementById("adminLoginForm"),
    adminEmail: document.getElementById("adminEmail"),
    adminPassword: document.getElementById("adminPassword"),
    loginMessage: document.getElementById("adminLoginMessage"),
    logoutButton: document.getElementById("adminLogoutButton"),
    adminMetrics: document.getElementById("adminMetrics"),
    cmsForm: document.getElementById("cmsForm"),
    cmsMode: document.getElementById("cmsMode"),
    cmsUrlField: document.getElementById("cmsUrlField"),
    cmsFileField: document.getElementById("cmsFileField"),
    cmsUrl: document.getElementById("cmsUrl"),
    cmsFile: document.getElementById("cmsFile"),
    cmsTitle: document.getElementById("cmsTitle"),
    cmsDuration: document.getElementById("cmsDuration"),
    cmsSubject: document.getElementById("cmsSubject"),
    cmsChapter: document.getElementById("cmsChapter"),
    cmsAttachments: document.getElementById("cmsAttachments"),
    cmsMessage: document.getElementById("cmsMessage"),
    moderationLesson: document.getElementById("moderationLesson"),
    moderationList: document.getElementById("moderationList"),
    adminReplyForm: document.getElementById("adminReplyForm"),
    adminReplyParentId: document.getElementById("adminReplyParentId"),
    adminReplyText: document.getElementById("adminReplyText"),
    adminReplyState: document.getElementById("adminReplyState"),
    adminReplyCancel: document.getElementById("adminReplyCancel"),
    engagementMetrics: document.getElementById("engagementMetrics"),
    studentTableBody: document.getElementById("studentTableBody"),
    lessonInventory: document.getElementById("lessonInventory")
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
  }

  function isAuthenticated() {
    return window.sessionStorage.getItem(authKey) === "true";
  }

  function setAuthenticated(nextValue) {
    window.sessionStorage.setItem(authKey, nextValue ? "true" : "false");
  }

  function currentModerationLesson() {
    return dom.moderationLesson.value || platform.flattenLibrary(state)[0].id;
  }

  function parseAttachments(rawValue) {
    return rawValue
      .split("\n")
      .map(function splitLine(line) {
        return line.trim();
      })
      .filter(Boolean)
      .map(function parseLine(line) {
        var parts = line.split("|");
        return {
          title: parts[0] || "Attachment",
          url: parts[1] || "#",
          type: parts[2] || "Resource"
        };
      });
  }

  function renderAuthState() {
    var authed = isAuthenticated();
    dom.loginCard.classList.toggle("is-hidden", authed);
    dom.adminApp.classList.toggle("is-hidden", !authed);

    if (authed) {
      renderApp();
    }
  }

  function renderAdminMetrics() {
    var metrics = platform.getAdminMetrics(state);
    dom.adminMetrics.innerHTML =
      '<article class="admin-kpi"><span class="kpi-label">Active subscriptions</span><strong class="admin-kpi__value">' +
      escapeHtml(String(metrics.activeSubscriptions)) +
      "</strong><div class=\"admin-kpi__stats\">" +
      metrics.planBreakdown
        .map(function eachPlan(plan) {
          return "<span>" + escapeHtml(plan.plan) + ": " + escapeHtml(String(plan.active)) + "</span>";
        })
        .join("") +
      "</div></article>" +
      '<article class="admin-kpi"><span class="kpi-label">Expired subscriptions</span><strong class="admin-kpi__value">' +
      escapeHtml(String(metrics.expiredSubscriptions)) +
      "</strong><div class=\"admin-kpi__stats\">" +
      metrics.planBreakdown
        .map(function eachPlan(plan) {
          return "<span>" + escapeHtml(plan.plan) + ": " + escapeHtml(String(plan.expired)) + "</span>";
        })
        .join("") +
      "</div></article>" +
      '<article class="admin-kpi"><span class="kpi-label">Average watch time</span><strong class="admin-kpi__value">' +
      escapeHtml(metrics.averageWatchMinutes + " min") +
      "</strong><span class=\"panel__hint\">Across all published lessons.</span></article>" +
      '<article class="admin-kpi"><span class="kpi-label">Average drop-off</span><strong class="admin-kpi__value">' +
      escapeHtml(Math.round(metrics.averageDropOff * 100) + "%") +
      "</strong><span class=\"panel__hint\">Higher values indicate lessons needing tighter pacing.</span></article>";
  }

  function renderModerationLessonOptions() {
    var lessons = platform.flattenLibrary(state);
    var currentValue = dom.moderationLesson.value;
    dom.moderationLesson.innerHTML = lessons
      .map(function eachLesson(lesson) {
        return (
          '<option value="' +
          escapeHtml(lesson.id) +
          '">' +
          escapeHtml(lesson.subjectTitle + " / " + lesson.title) +
          "</option>"
        );
      })
      .join("");

    if (
      currentValue &&
      lessons.some(function hasCurrent(lesson) {
        return lesson.id === currentValue;
      })
    ) {
      dom.moderationLesson.value = currentValue;
    }
  }

  function renderThreadNode(node, isReply) {
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
      '<div class="discussion-item__actions">' +
      '<button class="comment-action" type="button" data-admin-reply="' +
      escapeHtml(node.id) +
      '">Reply</button>' +
      '<button class="comment-action" type="button" data-admin-pin="' +
      escapeHtml(node.id) +
      '">' +
      (node.pinned ? "Unpin" : "Pin to top") +
      "</button>" +
      "</div>" +
      (node.replies.length
        ? '<div class="discussion-thread">' +
          node.replies
            .map(function eachReply(reply) {
              return renderThreadNode(reply, true);
            })
            .join("") +
          "</div>"
        : "") +
      "</article>"
    );
  }

  function renderModerationList() {
    var lessonId = currentModerationLesson();
    var threads = platform.getThreadedComments(state, lessonId);
    dom.moderationList.innerHTML = threads.length
      ? threads
          .map(function eachThread(thread) {
            return renderThreadNode(thread, false);
          })
          .join("")
      : '<article class="discussion-item"><strong>No discussion yet</strong><span class="panel__hint">This lesson has no student questions yet.</span></article>';
  }

  function renderEngagementMetrics() {
    var metrics = platform.getAdminMetrics(state);
    dom.engagementMetrics.innerHTML = metrics.topLessons
      .map(function eachLesson(item) {
        return (
          '<article class="analytics-card">' +
          "<strong>" +
          escapeHtml(item.title) +
          "</strong>" +
          '<span class="analytics-card__meta">' +
          escapeHtml(item.subjectTitle) +
          "</span>" +
          '<div class="analytics-card__bar"><span class="panel__hint">Views</span><div class="bar-track"><span style="width:' +
          escapeHtml(String(Math.min(100, item.views))) +
          '%"></span></div></div>' +
          '<div class="value-pair"><span>Average watch</span><strong>' +
          escapeHtml(item.avgWatchMinutes + " min") +
          "</strong></div>" +
          '<div class="value-pair"><span>Drop-off rate</span><strong>' +
          escapeHtml(Math.round(item.dropOffRate * 100) + "%") +
          "</strong></div>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderStudentTable() {
    dom.studentTableBody.innerHTML = state.students
      .map(function eachStudent(student) {
        return (
          "<tr>" +
          "<td><strong>" +
          escapeHtml(student.name) +
          '</strong><br /><span class="panel__hint">' +
          escapeHtml(student.email) +
          "</span></td>" +
          "<td>" +
          escapeHtml(student.plan.replace("-", " ")) +
          "</td>" +
          '<td><span class="status-chip status-chip--' +
          escapeHtml(student.status) +
          '">' +
          escapeHtml(student.status) +
          "</span></td>" +
          "<td>" +
          escapeHtml(String(student.progressPercent)) +
          "%</td>" +
          "<td>" +
          escapeHtml(student.rank) +
          "</td>" +
          "<td>" +
          escapeHtml(platform.formatDate(student.lastActiveAt)) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function renderInventory() {
    dom.lessonInventory.innerHTML = platform
      .flattenLibrary(state)
      .map(function eachLesson(lesson) {
        return (
          '<article class="inventory-item"><strong>' +
          escapeHtml(lesson.title) +
          "</strong><div class=\"inventory-item__meta\">" +
          escapeHtml(lesson.subjectTitle + " / " + lesson.chapterTitle) +
          "</div><div class=\"inventory-item__meta\">" +
          escapeHtml(lesson.sourceType + " • " + lesson.durationMinutes + " min") +
          "</div></article>"
        );
      })
      .join("");
  }

  function renderApp() {
    refreshState();
    renderAdminMetrics();
    renderModerationLessonOptions();
    renderEngagementMetrics();
    renderStudentTable();
    renderInventory();
    renderModerationList();
  }

  function clearReplyState() {
    replyParentId = null;
    dom.adminReplyParentId.value = "";
    dom.adminReplyState.textContent = "";
  }

  function handleLogin(event) {
    event.preventDefault();
    var email = dom.adminEmail.value.trim();
    var password = dom.adminPassword.value;

    if (email === platform.ADMIN_EMAIL && password === platform.ADMIN_PASSWORD) {
      setAuthenticated(true);
      dom.loginMessage.textContent = "";
      renderAuthState();
      return;
    }

    dom.loginMessage.textContent = "Credentials do not match the configured admin portal access.";
  }

  function handleCmsModeChange() {
    var isFile = dom.cmsMode.value === "file";
    dom.cmsUrlField.classList.toggle("is-hidden", isFile);
    dom.cmsFileField.classList.toggle("is-hidden", !isFile);
    dom.cmsUrl.required = !isFile;
  }

  function handleCmsSubmit(event) {
    event.preventDefault();
    var sourceType = dom.cmsMode.value;
    var sourceUrl = sourceType === "file" ? "" : dom.cmsUrl.value.trim();

    if (sourceType !== "file" && !sourceUrl) {
      dom.cmsMessage.textContent = "A video URL is required for external and YouTube sources.";
      return;
    }

    platform.addLessonFromAdmin(state, {
      title: dom.cmsTitle.value.trim(),
      durationMinutes: dom.cmsDuration.value,
      subjectTitle: dom.cmsSubject.value.trim(),
      chapterTitle: dom.cmsChapter.value.trim(),
      sourceType: sourceType,
      sourceUrl: sourceUrl,
      summary:
        sourceType === "file"
          ? "Staged direct-upload lesson created from the admin portal prototype."
          : "Admin-published lesson for the premium VOD library.",
      tags: sourceType === "youtube" ? ["YouTube wrapped"] : ["Admin release"],
      attachments: parseAttachments(dom.cmsAttachments.value)
    });

    dom.cmsForm.reset();
    dom.cmsMode.value = "external";
    handleCmsModeChange();
    dom.cmsMessage.textContent = "Lesson published to the shared VOD library.";
    renderApp();
  }

  function handleModerationClick(event) {
    var replyButton = event.target.closest("[data-admin-reply]");
    if (replyButton) {
      replyParentId = replyButton.dataset.adminReply;
      dom.adminReplyParentId.value = replyParentId;
      dom.adminReplyState.textContent = "Replying to a specific thread.";
      dom.adminReplyText.focus();
      return;
    }

    var pinButton = event.target.closest("[data-admin-pin]");
    if (pinButton) {
      platform.setPinnedComment(state, currentModerationLesson(), pinButton.dataset.adminPin);
      renderModerationList();
      return;
    }
  }

  function handleAdminReply(event) {
    event.preventDefault();
    if (!dom.adminReplyText.value.trim()) {
      return;
    }

    platform.addComment(state, currentModerationLesson(), {
      parentId: replyParentId,
      authorName: "Admin Team",
      authorEmail: platform.ADMIN_EMAIL,
      authorRole: "admin",
      text: dom.adminReplyText.value.trim(),
      official: true
    });

    dom.adminReplyText.value = "";
    clearReplyState();
    renderModerationList();
  }

  function attachEvents() {
    dom.loginForm.addEventListener("submit", handleLogin);
    dom.logoutButton.addEventListener("click", function onLogout() {
      setAuthenticated(false);
      renderAuthState();
    });
    dom.cmsMode.addEventListener("change", handleCmsModeChange);
    dom.cmsForm.addEventListener("submit", handleCmsSubmit);
    dom.moderationLesson.addEventListener("change", renderModerationList);
    dom.moderationList.addEventListener("click", handleModerationClick);
    dom.adminReplyForm.addEventListener("submit", handleAdminReply);
    dom.adminReplyCancel.addEventListener("click", clearReplyState);
    window.addEventListener("storage", function onStorage(storageEvent) {
      if (storageEvent.key === platform.STORAGE_KEY && isAuthenticated()) {
        renderApp();
      }
    });
  }

  handleCmsModeChange();
  attachEvents();
  renderAuthState();
})(window, document);
