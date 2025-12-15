import { ObjectId } from 'mongodb';

export const isValidObjectId = (id: string, message?: string) => {
  if (!ObjectId.isValid(id)) {
    throw new Error(message || 'Invalid ID');
  }
  return true;
};

export const isValidFullName = (value: string) => {
  if (value) {
    const splitArray = value.split(/\s+/);
    const firstAndLastName =
      splitArray.length > 1 && !!splitArray[0] && !!splitArray[splitArray.length - 1];
    return (
      firstAndLastName &&
      splitArray[0].trim().length > 1 &&
      splitArray[splitArray.length - 1].trim().length > 1
    );
  }
  return false;
};
