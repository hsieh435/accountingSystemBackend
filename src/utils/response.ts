import { Request, Response } from "express";



export const success = ({ data = [], message = "成功", req, res }: { data?: any; message?: string; req: Request; res: Response }) => {
  // console.log("req:", req);
  // console.log("res:", res);

  const response = {
    config: {
      url: req.originalUrl,
      method: req.method
    },
    data: {
      returnCode: 0,
      data: data,
      message: message
    },
    headers: {
      "content-type": res.getHeader("Content-Type") || "application/json"
    },
    request: {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    status: 200,
    statusText: "OK",
  };
  // res.json(response);

  return response;
};




export const error = ({ data = [], message = "錯誤", req, res }: { data?: any; message?: string; req: Request; res: Response }) => {

  const response = {
    config: {
      url: req.originalUrl,
      method: req.method
    },
    data: {
      returnCode: -1,
      data: data,
      message: message
    },
    headers: {
      "content-type": res.getHeader("Content-Type") || "application/json"
    },
    request: {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    status: 0,
    statusText: "OK",
  };
  // res.json(response);

  return response;
  // return { data, message, returnCode };
};
