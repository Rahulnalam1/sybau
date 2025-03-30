// src/api/controllers/trello/trelloController.ts

import { TrelloService } from "@/api/services/trello/trelloService"
import { CreateCardParams, UpdateCardParams } from "@/types/types"

export class TrelloController {
  private trelloService: TrelloService

  constructor() {
    this.trelloService = new TrelloService()
  }

  async getBoards(userId: string) {
    return await this.trelloService.getBoards(userId)
  }

  async createCard(params: CreateCardParams) {
    return await this.trelloService.createCard(params)
  }

  async updateCard(params: UpdateCardParams) {
    return await this.trelloService.updateCard(params)
  }

  async deleteCard(cardId: string) {
    return await this.trelloService.deleteCard(cardId)
  }

  async getBoardLists(boardId: string) {
    return await this.trelloService.getBoardLists(boardId)
  }
}
