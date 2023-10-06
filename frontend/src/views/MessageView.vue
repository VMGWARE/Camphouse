<template>
  <div class="container">
    <h2>Messages</h2>

    <div class="row">
      <div class="col-md-3">
        <!-- Sidebar with connections -->
        <div class="list-group" id="connectionsSidebar">
          <a
            href="#"
            class="list-group-item user-item"
            v-for="user in connections"
            :key="user._id"
            :class="{
              active: selectedConnection && selectedConnection._id === user._id,
            }"
            @click.prevent="selectConnection(user)"
            @contextmenu.prevent="showContextMenu(user, $event)"
            :hidden="user._id === currentConnection._id"
          >
            {{ user.username }}
            <div class="small-text">@{{ user.handle }}</div>
            <!-- Circle with number of unread messages in it -->
            <span
              v-if="user.unreadCount > 0"
              class="badge badge-primary unread-count"
              >{{ user.unreadCount }}</span
            >
          </a>
          <span v-if="connections.length === 0" class="text-muted">
            <i class="fas fa-spinner fa-spin"></i>
            No connections yet.
          </span>
        </div>
      </div>

      <div class="col-md-9">
        <!-- Messages container -->
        <div class="messages-card-container card dark-card">
          <div class="card-body" id="messagesContainer">
            <div v-if="loadingMessages" class="loading-icon">
              <i class="fas fa-spinner fa-spin"></i>
              Loading messages...
            </div>
            <div v-else>
              <div
                v-for="message in sortedMessages"
                :key="message._id"
                class="message"
                :class="{
                  'message-sent': currentConnection._id === message.sender._id,
                  'message-received':
                    currentConnection._id !== message.sender._id,
                }"
              >
                <strong
                  ><router-link
                    :to="'/@' + message.sender.handle"
                    class="username-link"
                    >{{ message.sender.username }}</router-link
                  ></strong
                >: {{ message.content }}
                <div class="d-flex justify-content-between align-items-center">
                  <div class="action-buttons">
                    <div class="timestamp">
                      Sent at {{ formatDate(message.createdAt) }}
                    </div>
                    <div
                      v-if="
                        currentConnection._id !== message.sender._id &&
                        !message.isRead
                      "
                    >
                      <button
                        class="btn btn-round btn-sm btn-primary mark-as-read-button"
                        @click="markAsRead(message._id)"
                      >
                        Mark as read
                      </button>
                    </div>
                  </div>
                  <div
                    class="status-indicator"
                    v-if="currentConnection._id === message.sender._id"
                  >
                    <span
                      class="dot"
                      :class="{ red: !message.isRead, green: message.isRead }"
                    ></span>
                    <span v-if="!message.isRead">Not Read</span>
                    <span v-if="message.isRead">Read</span>
                  </div>
                </div>
              </div>
              <div v-if="!messages.length && selectedConnection">
                <div class="alert alert-info">
                  You have no messages with this user.
                </div>
              </div>
              <div v-if="!selectedConnection">
                <div class="alert alert-info">
                  Select a user to view messages.
                </div>
              </div>
            </div>
          </div>

          <div class="input-group mt-3">
            <input
              type="text"
              class="form-control"
              placeholder="Type your message..."
              v-model="newMessageContent"
              :class="{ 'disabled-input': !selectedConnection }"
              :disabled="!selectedConnection"
            />
            <button
              class="btn btn-primary"
              @click="sendMessage"
              :disabled="!selectedConnection"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="contextMenuVisible"
    :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
    :class="{ 'show-context-menu': contextMenuVisible }"
    class="context-menu"
    ref="contextMenu"
  >
    <ul>
      <li @click="copyToClipboard(selectedConnectionContext.handle)">
        Copy Handle
      </li>
      <li @click="copyToClipboard(selectedConnectionContext._id)">Copy ID</li>
      <!-- Go to profile -->
      <li @click="contextMenuVisible = false">
        <router-link
          :to="'/@' + selectedConnectionContext.handle"
          class="username-link"
          >Go to profile</router-link
        >
      </li>
    </ul>
  </div>
</template>

<style scoped>
.container {
  margin-top: 20px;
  width: 100%;
  max-width: 1200px;
}

.messages-card-container {
  /* Must not go below the screen */
  max-height: calc(100vh - 200px);
  overflow-y: auto; /* Enable scrolling when content exceeds max height */
  padding: 16px; /* Add some internal padding */
  position: relative; /* Allow positioning of child elements relative to this container */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Optional: add a shadow for a "card" effect */
  border-radius: 10px; /* Optional: round the corners for a softer appearance */
}

.dark-card {
  background-color: #2f3136;
  color: #b9bbbe;
}

.message {
  padding: 10px;
  margin: 10px 0;
  border-radius: 15px;
  position: relative;
  max-width: 80%;
}

.message-sent {
  background-color: #36393f;
  align-self: flex-end;
}

.message-received {
  background-color: #40444b;
  align-self: flex-start;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mark-as-read-button {
  font-size: 0.8em;
  /* MAke it smaller, it is way to big */
  padding: 0.2em 0.5em;
}
.timestamp {
  font-size: 0.8em;
  color: #aaa;
}
.status-indicator {
  display: flex;
  align-items: center;
  font-size: 0.8em;
  color: grey;
  gap: 5px;
}
.dot {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  display: inline-block;
}
.dot.red {
  background-color: red;
}
.dot.green {
  background-color: green;
}
.username-link {
  /* Remove underline */
  text-decoration: none;
  color: inherit;
}
.context-menu {
  position: absolute;
  background-color: #ffffff;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  padding: 5px;
  color: #333;
  font-size: 0.8em;
  /* Curve corners */
  border-radius: 5px;
  transition: opacity 0.3s, visibility 0.3s;
  opacity: 0;
}
.context-menu.show-context-menu {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s, visibility 0.3s;
}

.context-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.context-menu li {
  padding: 5px 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.context-menu li:hover {
  background-color: #f0f0f0;
}
#connectionsSidebar {
  background-color: #202225;
  border-radius: 5px;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
}

#connectionsSidebar a {
  /* existing styles */
  transition: background-color 0.3s, color 0.3s;
}

#connectionsSidebar a:hover {
  background-color: #f0f0f0;
  color: #ffc34d;
  border-color: #ffc34d;
}
#connectionsSidebar a.active {
  background-color: #ffc34d;
  color: #333;
  border-color: #ffc34d;
}
#connectionsSidebar a.active:hover {
  background-color: #ffc34d;
  color: #333;
  border-color: #ffc34d;
}
#connectionsSidebar .user-item {
  position: relative; /* Makes it the reference for absolutely positioned children */
  background-color: #202225;
  border: none;
  color: #dcddde;
  margin-bottom: 5px;
  border-radius: 5px;
}

#connectionsSidebar .user-item:hover {
  background-color: #2f3136 !important;
  color: #ffffff !important;
  border-radius: 5px;
  transition: background-color 1s;
}

#connectionsSidebar .user-item.active {
  background-color: #2f3136 !important;
  color: #ffffff !important;
  border-radius: 5px;
}

.input-group {
  border-top: 1px solid #34373c;
  background-color: #2f3136;
  padding: 10px;
}

.input-group input {
  background-color: #40444b;
  border-radius: 10px;
  border: none;
  color: #dcddde;
  padding: 10px;
}

.input-group button {
  background-color: #7289da;
  border: none;
  border-radius: 5px;
  color: #ffffff;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.input-group button:hover {
  background-color: #5865f2;
}
.list-group {
  padding: 10px;
}

.card-body {
  overflow-y: auto;
  max-height: 75vh;
  padding: 20px;
}

.message {
  margin-bottom: 15px;
}

.message-sent,
.message-received {
  max-width: 400px;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 10px;
  font-size: 14px;
  position: relative;
}

.message-sent {
  margin-left: auto;
  background-color: #444444; /* Dark background for sent messages */
  color: #ffffff; /* White text for sent messages */
}

.message-received {
  margin-right: auto;
  background-color: #222222; /* Slightly lighter background for received messages */
  color: #dddddd; /* Lighter text for received messages */
}

/* Additional styles for better visuals */
.chat-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
}

/* Including a style to properly space individual messages */
.message-sent + .message-received,
.message-received + .message-sent {
  margin-top: 20px;
}

/* Adding some space at the end of the chat for better UX */
.chat-container::after {
  content: "";
  flex: 1;
}

.small-text {
  font-size: 0.75em; /* Adjust as necessary */
  color: #aaa; /* Adjust as necessary */
}

.disabled-input {
  background-color: #40444b;
  color: #dcddde;
  cursor: not-allowed;
}

.unread-count {
  font-size: 0.8em;
  background-color: #7289da;
  color: #ffffff;
  padding: 2px 5px;
  border-radius: 5px;
}

.unread-count {
  position: absolute; /* Take it out of the flow */
  right: 10px; /* Move it to the right side */
  top: 50%; /* Center it vertically */
  transform: translateY(-50%); /* Adjust positioning */
  z-index: 1; /* Ensure it's above other elements */
  background-color: #7289da;
  color: #ffffff;
  padding: 2px 5px;
  border-radius: 5px;
}
</style>

<script>
import axios from "axios";

export default {
  data() {
    return {
      connections: [],
      messages: [],
      currentConnection: null,
      selectedConnection: null,
      newMessageContent: "",
      contextMenuVisible: false,
      contextMenuX: 0,
      contextMenuY: 0,
      selectedConnectionContext: null,
      loadingMessages: false,
    };
  },
  computed: {
    sortedMessages() {
      return [...this.messages].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    },
  },
  methods: {
    async fetchConnections() {
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${localStorage.getItem("token")}`;
        const response = await axios.get("/v1/messages/connections");
        this.connections = response.data.data;
        console.log("Fetched connections:", this.connections.length);
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    },
    selectUserFromUrl() {
      // Get the user ID from the URL
      const userId = this.$route.params.userId;

      // Find and select the user with the matching ID
      if (userId) {
        const user = this.connections.find((user) => user._id === userId);
        if (user._id == this.currentConnection._id) {
          console.log("You cannot message yourself");
        } else if (user) {
          console.log(`Found user ${userId} in URL, selecting...`);
          this.selectConnection(user);
        } else {
          console.log("User not found:", userId);
        }
      }
    },
    async fetchMessages(userId) {
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${localStorage.getItem("token")}`;
        const response = await axios.get(`/v1/messages/${userId}`);
        this.messages = response.data.data;
        this.selectedConnection = this.connections.find(
          (user) => user._id === userId
        );
        console.log(
          `Fetched ${this.messages.length} messages for user ${userId}`
        );
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    },
    async sendMessage() {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${localStorage.getItem("token")}`;
      if (this.newMessageContent.trim()) {
        try {
          await axios.post(`/v1/messages/${this.selectedConnection._id}`, {
            content: this.newMessageContent.trim(),
          });
          this.newMessageContent = "";
          this.fetchMessages(this.selectedConnection._id);
          console.log(
            "Message sent to user:",
            this.selectedConnection.username
          );
        } catch (error) {
          console.error("Error sending message:", error);
        }
      }
    },
    selectConnection(user) {
      this.loadingMessages = true;
      this.selectedConnection = user;
      this.$router.push({ name: "Messages", params: { userId: user._id } });
      this.fetchMessages(user._id).then(() => {
        this.loadingMessages = false;
        // Scroll to the bottom of the messages container
        this.$nextTick(() => {
          const messagesContainer =
            document.getElementById("messagesContainer");
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
      });
    },
    formatDate(value) {
      if (!value) return "";
      const date = new Date(value);
      return date.toLocaleString();
    },
    async markAsRead(messageId) {
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${localStorage.getItem("token")}`;
        await axios.put(`/v1/messages/${messageId}`);
        this.messages = this.messages.map((message) => {
          if (message._id === messageId) {
            message.isRead = true;
          }
          return message;
        });
        this.selectedConnection.unreadCount--;
        console.log("Marked message as read:", messageId);
        // After marking the message as read, fetch the messages again to update the list
        this.fetchMessages(this.selectedConnection._id);
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    },
    showContextMenu(user, event) {
      this.selectedConnectionContext = user;
      this.contextMenuVisible = true;
      this.contextMenuX = event.clientX;
      this.contextMenuY = event.clientY;
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(
        () => {
          console.log("Text copied to clipboard");
          this.contextMenuVisible = false;
        },
        (err) => {
          console.error("Could not copy text to clipboard:", err);
        }
      );
    },
    handleBodyClick(event) {
      if (
        this.$refs.contextMenu &&
        !this.$refs.contextMenu.contains(event.target)
      ) {
        console.log("Clicked outside context menu");
        this.contextMenuVisible = false;
      }
    },
  },
  created() {
    this.currentConnection = JSON.parse(localStorage.getItem("user"));
    this.fetchConnections().then(() => {
      this.selectUserFromUrl();
    });
  },
  mounted() {
    console.log("Mounted... messages");
    this.timer = setInterval(() => {
      console.log("Fetching messages...");
      if (this.selectedConnection) {
        this.fetchMessages(this.selectedConnection._id);
      }
    }, 60000); // 60,000 milliseconds = 1 minute
    document.addEventListener("click", this.handleBodyClick);
  },
  unmounted() {
    console.log("Unmounting... messages");
    clearInterval(this.timer); // Clear the timer when the component is destroyed
    document.removeEventListener("click", this.handleBodyClick);
  },
};
</script>
