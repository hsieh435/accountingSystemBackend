import { Request, Response } from "express";
import pool from "../db";
import * as tradeService from "./../services/tradeCategoryServices";



export const getAll = async (req: Request, res: Response) => {
  console.log( 100);
  try {
    const result = await tradeService.getAllTradeCategory();
    console.log("result:", result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};



export const getOne = async (req: Request, res: Response) => {
  try {
    const trade = await tradeService.getTradeByCode(req.params.code);
    if (!trade) return res.status(404).send("Not found");
    res.json(trade);
  } catch (err) {
    res.status(500).send("Server error");
  }
};



export const create = async (req: Request, res: Response) => {
  try {
    const { trade_code, trade_name, sort } = req.body;
    const trade = await tradeService.createTrade(trade_code, trade_name, sort);
    res.status(201).json(trade);
  } catch (err) {
    res.status(500).send("Server error");
  }
};




export const update = async (req: Request, res: Response) => {
  try {
    const { trade_name, sort } = req.body;
    const trade = await tradeService.updateTrade(req.params.code, trade_name, sort);
    if (!trade) return res.status(404).send("Not found");
    res.json(trade);
  } catch (err) {
    res.status(500).send("Server error");
  }
};



export const remove = async (req: Request, res: Response) => {
  try {
    const trade = await tradeService.deleteTrade(req.params.code);
    if (!trade) return res.status(404).send("Not found");
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).send("Server error");
  }
};