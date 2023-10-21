// Packages
const Permission = require("../models/Permission");
const Role = require("../models/Role");
const RoleHasPermission = require("../models/RoleHasPermission");
const chalk = require("chalk");

// Load environment variables
require("dotenv").config();

// TODO: If the perms or roles have been updated, update the permissions and roles in the database too

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

// Create the permissions
const createPermissions = async () => {
  // Loop through each permission
  for (let i = 0; i < permissionsAndRoles.permissions.length; i++) {
    // Destructure the name and description from the permission
    const { name, description } = permissionsAndRoles.permissions[i];

    // Create the permission
    const permission = new Permission({
      name,
      description,
    });

    // Save the permission
    try {
      await permission.save();
      console.log(chalk.green(`Permission ${name} created successfully`));
    } catch (error) {
      // If the permission already exists, skip it
      if (error.code === 11000) {
        console.log(
          chalk.yellow(`Permission ${name} already exists. Skipping...`)
        );
        continue;
      } else {
        console.log(error);
      }
    }
  }
};

// Create the roles
const createRoles = async () => {
  // Loop through each role
  for (let i = 0; i < permissionsAndRoles.roles.length; i++) {
    // Destructure the name, description and permissions from the role
    const { name, description, permissions } = permissionsAndRoles.roles[i];

    // Create the role
    const role = new Role({
      name,
      description,
    });

    // Save the role
    try {
      await role.save();
      console.log(chalk.green(`Role ${name} created successfully`));
    } catch (error) {
      // If the role already exists, skip it
      if (error.code === 11000) {
        console.log(chalk.yellow(`Role ${name} already exists. Skipping...`));
        continue;
      } else {
        console.log(error);
      }
    }

    // Loop through each permission
    for (let j = 0; j < permissions.length; j++) {
      // Find the permission
      const permission = await Permission.findOne({
        name: permissions[j],
      });

      // Check if the permission exists
      if (!permission) {
        console.log(
          chalk.yellow(
            `Permission ${permissions[j]} does not exist. Skipping...`
          )
        );
        continue;
      } else {
        // Create the role has permission
        const roleHasPermission = new RoleHasPermission({
          role: role._id,
          permission: permission._id,
        });

        // Save the role has permission
        try {
          await roleHasPermission.save();
          console.log(
            chalk.green(
              `Role has been assigned permission ${permissions[j]} successfully`
            )
          );
        } catch (error) {
          // If the role has permission already exists, skip it
          if (error.code === 11000) {
            console.log(
              chalk.yellow(
                `Role has already been assigned permission ${permissions[j]}. Skipping...`
              )
            );
            continue;
          } else {
            console.log(error);
          }
        }
      }
    }
  }
};

// Create the permissions and roles
const createPermissionsAndRoles = async () => {
  // Create the permissions
  await createPermissions();

  // Create the roles
  await createRoles();
};

module.exports = { createPermissionsAndRoles };
