const {Schema, model} = require('mongoose');
const {isEmail} = require('validator')

const bcrypt = require('bcryptjs');


const userSchema = new Schema({
    name: {
        type:String,
        required: [true, 'Please, enter a name']
    },
    email: {
        type:String,
        required: [true, 'Please, enter an email'],
        unique: true,
        lowercase: true,
        validate:[isEmail, 'Please, enter a valid email address']
    },
    password: {
        type:String,
        required: [true,'Please, enter a 6 characters min length password'],
        minlength:[6,'Please, enter a 6 characters min length password']
    }
})

userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

userSchema.statics.login = async function(email, password) {

    if(email === ''){
        throw new Error('email is empty');
    }
    if(password === ''){
        throw new Error('pwd is empty');
    }

    const user = await this.findOne({email});
    if(user){
        const isAuthenticated = await bcrypt.compare(password, user.password);
        if(isAuthenticated){
            return user;
        }

        throw new Error('incorrect pwd');
    }else{
        throw new Error('incorrect email');
    }

}

module.exports = model('User', userSchema);