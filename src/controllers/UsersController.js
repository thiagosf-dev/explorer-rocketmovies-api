"use strict";

const { compare, hash } = require("bcrypt");
const sqliteConnection = require("../database/sqlite");
const AppError = require("../utils/AppError");

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;

    const database = await sqliteConnection();

    const queryCheckUserExists = await database.get(
      "SELECT * FROM users WHERE email=(?)",
      [email]
    );

    const hashedPasword = await hash(password, 8);

    if (queryCheckUserExists) {
      const { message, statusCode } = new AppError(
        "Este e-mail já está em uso.",
        400
      );
      return response.status(statusCode).json({ message, statusCode });
    }

    await database.run(
      "INSERT INTO users (name, email, password) VALUES (?,?,?)",
      [name, email, hashedPasword]
    );

    return response.status(201).json();
  }

  async update(request, response) {
    const { name, email, password, oldPassword } = request.body;
    const user_id = request.user.id;
    const database = await sqliteConnection();

    const user = await database.get("SELECT * FROM users WHERE id=(?)", [
      user_id,
    ]);
    if (!user) {
      const { message, statusCode } = new AppError(
        "Usuário não encontrado.",
        400
      );
      return response.status(statusCode).json({ message, statusCode });
    }

    const userExists = await database.get(
      "SELECT * FROM users WHERE email=(?)",
      [email]
    );

    if (email !== user.email && userExists) {
      const { message, statusCode } = new AppError(
        "Este e-mail já está em uso.",
        400
      );
      return response.status(statusCode).json({ message, statusCode });
    }

    if (password && !oldPassword) {
      const { message, statusCode } = new AppError(
        "A senha atual deve ser informada.",
        400
      );
      return response.status(statusCode).json({ message, statusCode });
    }

    if (password && oldPassword) {
      const checkOldPassword = await compare(oldPassword, user.password);

      if (!checkOldPassword) {
        const { message, statusCode } = new AppError(
          "A senha está incorreta.",
          400
        );
        return response.status(statusCode).json({ message, statusCode });
      }

      user.password = await hash(password, 8);
    }

    user.name = name ?? user.name;
    user.email = user.email === email ? user.email : email;

    await database.run(
      `UPDATE users SET name=?, email=?, password=?, updated_at=DATETIME('now') WHERE id=?`,
      [user.name, user.email, user.password, user_id]
    );

    return response.status(200).json();
  }
}

module.exports = UsersController;
