document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Helper: obtener iniciales a partir de nombre o email
  function getInitials(text) {
    if (!text) return "";
    // si es email, tomar la parte antes de @
    const left = text.includes("@") ? text.split("@")[0] : text;
    const parts = left.split(/[.\-_ ]+/).filter(Boolean);
    if (parts.length === 0) return left.charAt(0).toUpperCase();
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        // Header and basic info
        const title = document.createElement("h4");
        title.textContent = name;
        activityCard.appendChild(title);

        const desc = document.createElement("p");
        desc.textContent = details.description;
        activityCard.appendChild(desc);

        const schedule = document.createElement("p");
        schedule.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;
        activityCard.appendChild(schedule);

        const spotsLeft = details.max_participants - details.participants.length;
        const avail = document.createElement("p");
        avail.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;
        activityCard.appendChild(avail);

        // Participants section
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants";

        const pTitle = document.createElement("h5");
        pTitle.textContent = "Participantes";
        participantsDiv.appendChild(pTitle);

        const list = document.createElement("ul");

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          details.participants.forEach((p) => {
            const li = document.createElement("li");

            const avatar = document.createElement("span");
            avatar.className = "participant-avatar";
            avatar.textContent = getInitials(p);

            // Botón eliminar
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-participant-btn";
            deleteBtn.title = "Eliminar participante";
            deleteBtn.innerHTML = "🗑️";
            deleteBtn.style.marginLeft = "8px";
            deleteBtn.style.background = "none";
            deleteBtn.style.border = "none";
            deleteBtn.style.cursor = "pointer";
            deleteBtn.style.fontSize = "18px";
            deleteBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              if (confirm(`¿Eliminar a ${nameSpan.textContent}?`)) {
                try {
                  const response = await fetch(`/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(p)}`, {
                    method: "DELETE",
                  });
                  if (response.ok) {
                    fetchActivities();
                  } else {
                    alert("No se pudo eliminar al participante.");
                  }
                } catch (err) {
                  alert("Error de red al eliminar participante.");
                }
              }
            });
            const nameSpan = document.createElement("span");
            nameSpan.className = "participant-name";
            // Mostrar nombre legible: si es email, mostrar parte antes de @, sino mostrar tal cual
            li.appendChild(deleteBtn);
            nameSpan.textContent = p.includes("@") ? p.split("@")[0] : p;

            li.appendChild(avatar);
            li.appendChild(nameSpan);
            list.appendChild(li);
          });
        } else {
          const emptyLi = document.createElement("li");
          emptyLi.className = "no-participants";
          emptyLi.textContent = "No hay participantes aún.";
          list.appendChild(emptyLi);
        }

        participantsDiv.appendChild(list);
        activityCard.appendChild(participantsDiv);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
  messageDiv.textContent = result.message;
  messageDiv.className = "success";
  signupForm.reset();
  // Refrescar lista y selector, reiniciando el selector
  fetchActivities();
  activitySelect.value = "";
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
