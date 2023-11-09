<template>
  <div class="messaging-container full-height d-flex flex-row">
    <aside class="sidebar dark-card m-2 rounded">
      <div class="sidebar-section">
        <h3 class="card-title d-flex justify-content-between">
          <i class="fas fa-comment-alt"></i> Groups
          <button class="btn btn-primary btn-sm">+</button>
        </h3>
        <ul class="message-group-list dark-list">
          <li class="group-item dark-item active">
            <span class="group-name">4 Chads</span>
            <span class="message-preview">
              Doc: Have ya'll seen the latest SSniperWolf stuff!!
            </span>
          </li>
          <li class="group-item dark-item">
            <span class="group-name">Work Project</span>
            <span class="message-preview">Bob: Updated the design doc.</span>
          </li>
        </ul>
      </div>
      <div class="sidebar-section">
        <h3 class="card-title d-flex justify-content-between">
          <i class="fas fa-users"></i>
          Direct Messages
          <button class="btn btn-primary btn-sm">+</button>
        </h3>
        <ul class="dm-list dark-list">
          <li class="dm-item dark-item">
            <span class="dm-name">Charlie</span>
            <span class="message-preview"
              >Hey, are we still on for the meeting tomorrow?</span
            >
          </li>
        </ul>
      </div>
    </aside>
    <section class="message-viewer card dark-card m-2 rounded">
      <header class="message-header">
        <h2 class="card-title d-flex justify-content-between">
          4 Chads

          <!-- Settings -->
          <button class="btn btn-primary btn-sm">
            <i class="fas fa-cog"></i>
          </button>
        </h2>
      </header>
      <div class="message-area scrollable-feed">
        <div class="message received">
          <span class="sender-name">Doc</span>
          <p class="message-content card-text">
            Have ya'll seen the latest SSniperWolf stuff!!
          </p>
        </div>
        <div class="message sent">
          <span class="sender-name"
            >(You)

            <i class="fas fa-check"></i>
          </span>
          <p class="message-content card-text">
            Yeah, just watched a vid on it
          </p>
        </div>
      </div>
      <footer class="message-input">
        <textarea
          class="form-control"
          placeholder="Type a message..."
        ></textarea>
        <button class="btn btn-primary">Send</button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.messaging-container {
  display: flex;
  height: 100vh;
  background-color: #111111;
  color: #ffffff;
  font-family: "Fira Code", monospace;
}

.sidebar {
  width: 25%;
  padding: 20px;
  overflow-y: auto;
}

.sidebar-section h3 {
  margin-bottom: 10px;
}

.message-group-list,
.dm-list {
  list-style: none;
  padding: 0;
}

.group-item,
.dm-item {
  padding: 10px 0;
  border-bottom: 1px solid #333;
}

.group-item.active,
.dm-item.active {
  background-color: #333;
}

.group-name,
.dm-name {
  display: block;
  font-weight: bold;
}

.message-preview {
  font-size: 14px;
  color: #aaa;
}

.message-viewer {
  width: 75%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.message-header {
  padding-bottom: 20px;
  margin: 5px 0;
}

.message-area {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.message {
  max-width: 60%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  background-color: #333;
  color: #fff;
}

.message:hover {
  background-color: #444;
}

.message.sent {
  align-self: flex-end;
  background-color: #ffc34d;
  color: #333;
}

.message.received {
  align-self: flex-start;
}

.message-input {
  display: flex;
  flex-direction: column;
}

.message-input textarea {
  flex-grow: 1;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
  background-color: #333;
  color: #fff;
  font-size: 14px;
}

.message-input button {
  align-self: flex-end;
  padding: 8px 16px;
  border-radius: 30px;
  background-color: #ffc34d;
  color: #333;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.message-input button:hover {
  background-color: #e6b04d;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #212529;
}

::-webkit-scrollbar-thumb {
  background-color: #666666;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #555555;
}
</style>
