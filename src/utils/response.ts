
export const success = ({ data = [], message = "成功", returnCode = 0 }: { data?: any; message?: string; returnCode?: number }) => {
  return { data, message, returnCode };
};

export const error = ({ data = [], message = "錯誤", returnCode = 1 }: { data?: any; message?: string; returnCode?: number }) => {
  return { data, message, returnCode };
};
