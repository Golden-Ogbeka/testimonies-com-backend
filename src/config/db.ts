import colors from 'colors/safe';
import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log(colors.green('MongoDB Connected'));
  } catch (error) {
    console.log(colors.red("Couldn't connect to Mongo DB"));
    console.log(error);
  }
};
