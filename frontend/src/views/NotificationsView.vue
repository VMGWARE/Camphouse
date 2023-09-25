<template>
  <div class="container">
    <p class="text-danger">This is a demo page.</p>
    <h2>Notifications</h2>

    <div class="card dark-card">
      <div class="card-body">
        <ul class="list-group dark-list">
          <li class="list-group-item dark-item">
            <div class="notification">
              <div class="notification-icon">
                <i class="fa fa-envelope"></i>
              </div>
              <div class="notification-details">
                <p class="notification-message">
                  You have a new message from John Doe
                </p>
                <p class="notification-time">2 hours ago</p>
              </div>
            </div>
          </li>
          <li class="list-group-item dark-item">
            <div class="notification">
              <div class="notification-icon">
                <i class="fa fa-thumbs-up"></i>
              </div>
              <div class="notification-details">
                <p class="notification-message">Your post received 10 likes</p>
                <p class="notification-time">1 day ago</p>
              </div>
            </div>
          </li>
          <li class="list-group-item dark-item">
            <div class="notification">
              <div class="notification-icon">
                <i class="fa fa-comment"></i>
              </div>
              <div class="notification-details">
                <p class="notification-message">
                  Jane Smith commented on your post
                </p>
                <p class="notification-time">3 days ago</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
