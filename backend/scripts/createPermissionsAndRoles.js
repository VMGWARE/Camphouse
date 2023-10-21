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
    {
      name: "Create reports",
      description: "Allows the user to create reports",
    },
    {
      name: "Update reports",
      description: "Allows the user to update reports",
    },
    {
      name: "Delete reports",
      description: "Allows the user to delete reports",
    },
    {
      name: "View reports",
      description: "Allows the user to view reports",
    },
    {
      name: "Take action on reports",
      description: "Allows the user to take action on reports",
    },
    // Request Logs
    {
      name: "View request logs",
      description: "Allows the user to view request logs",
    },
    // Role Has Permissions
    {
      name: "View role has permissions",
      description: "Allows the user to view role has permissions",
    },
    {
      name: "Update role has permissions",
      description: "Allows the user to update role has permissions",
    },
    // Roles
    {
      name: "Create roles",
      description: "Allows the user to create roles",
    },
    {
      name: "Update roles",
      description: "Allows the user to update roles",
    },
    {
      name: "Delete roles",
      description: "Allows the user to delete roles",
    },
    {
      name: "View roles",
      description: "Allows the user to view roles",
    },
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
    {
      name: "View user roles",
      description: "Allows the user to view user roles",
    },
    {
      name: "Update user roles",
      description: "Allows the user to update user roles",
    },
  ],
  roles: [
    // Admin role
    {
      name: "Administrator",
      description:
        "A high-level user with comprehensive administrative rights, capable of managing all aspects of the platform.",
      permissions: ["all"],
    },
    // Moderator role
    {
      name: "Moderator",
      description:
        "A user responsible for overseeing community interactions, ensuring they abide by platform guidelines.",
      permissions: [],
    },
    // Default role
    {
      name: "Standard User",
      description:
        "The default role assigned to registered users, granting them typical user rights and permissions.",
      permissions: [
        "Create comments",
        "Update own comments",
        "Delete own comments",
        "Can follow",
        "Can unfollow",
        "Like posts",
        "Unlike posts",
        "Create messages",
        "Update own messages",
        "Delete own messages",
        "Create posts",
        "Update own posts",
        "Delete own posts",
      ],
    },
    // Guest role
    {
      name: "Visitor",
      description:
        "A role for unregistered users browsing the platform with limited interaction capabilities.",
      permissions: [],
    },
  ],
};
