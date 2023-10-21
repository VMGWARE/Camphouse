// Packages
const Permission = require("../models/Permission");
const Role = require("../models/Role");
const RoleHasPermission = require("../models/RoleHasPermission");
const chalk = require("chalk");

// Load environment variables
require("dotenv").config();

// Define the permissions and roles in a JSON object.
// We can then dynamically create the permissions and roles
// Allowing for new permissions and roles to be added easily in the future
const permissionsAndRoles = {
  permissions: [
    // Audit Logs
    // Blocked Email Domains
    // Comments
    {
      name: "Create comments",
      description: "Allows the user to create comments",
    },
    {
      name: "Update own comments",
      description: "Allows the user to update their own comments",
    },
    {
      name: "Update all comments",
      description: "Allows the user to update all comments",
    },
    {
      name: "Delete own comments",
      description: "Allows the user to delete their own comments",
    },
    {
      name: "Delete all comments",
      description: "Allows the user to delete all comments",
    },
    // Follows
    {
      name: "Can follow",
      description: "Allows the user to follow other users",
    },
    {
      name: "Can unfollow",
      description: "Allows the user to unfollow other users",
    },
    // Likes
    {
      name: "Like posts",
      description: "Allows the user to like posts",
    },
    {
      name: "Unlike posts",
      description: "Allows the user to unlike posts",
    },
    // Messages
    {
      name: "Create messages",
      description: "Allows the user to create messages",
    },
    {
      name: "Update own messages",
      description: "Allows the user to update their own messages",
    },
    {
      name: "Delete own messages",
      description: "Allows the user to delete their own messages",
    },
    // Permissions (You can't create, update or delete permissions)
    {
      name: "View permissions",
      description: "Allows the user to view permissions",
    },
    // Posts
    {
      name: "Create posts",
      description: "Allows the user to create posts",
    },
    {
      name: "Update own posts",
      description: "Allows the user to update their own posts",
    },
    {
      name: "Update all posts",
      description: "Allows the user to update all posts",
    },
    {
      name: "Delete own posts",
      description: "Allows the user to delete their own posts",
    },
    {
      name: "Delete all posts",
      description: "Allows the user to delete all posts",
    },
    // Reports
    // Request Logs
    // Role Has Permissions
    // Roles
    // Users
    {
      name: "Update users",
      description: "Allows the user to update users",
    },
    {
      name: "Delete users",
      description: "Allows the user to delete users",
    },
    {
      name: "View user emails",
      description: "Allows the user to view hidden content such as user emails",
    },
    // User Has Roles
  ],
  roles: [
    {
      name: "admin",
      description: "An admin user",
      permissions: ["create", "read", "update", "delete"],
    },
  ],
};
