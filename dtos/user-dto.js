

class UserDto {
    constructor(id, phone_number, updatedAt, createdAt) {
        this.id = id;
        this.phoneNumber = phone_number;
        this.updatedAt = updatedAt;
        this.createdAt = createdAt;
    }
}

module.exports = { UserDto };