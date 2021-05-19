const users = [];
const addUser = ({socket_id, name, user_id, room_id}) => {
    const exists =  users.find(user => user.room_id === room_id && user.user_id === user_id);

    if (exists){
        return {error: 'User already exists in this room'}
    }

    const user = {socket_id, name, user_id, room_id};

    users.push(user);
    console.log(users)
    return {user}
}

const removeUser = (socket_id) => {
    const index = users.find(user => user.socket_id === socket_id);

    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

const getUser = (socket_id) => {
    return users.find(user => user.socket_id === socket_id);
}

module.exports = {addUser, removeUser, getUser};