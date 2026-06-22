import { DietController } from "../http/controllers/diet.controller"
import { FoodController } from "../http/controllers/food.controller"
import { MongoConnectionManager } from "../lib/mongodb"
import { IDietRepository } from "../repositories/diet.repository.interface"
import { IFoodRepository } from "../repositories/food.repository.interface"
import { MongoDBDietRepository } from "../repositories/mongo/mongo-diet.repository"
import { MongoDBFoodRepository } from "../repositories/mongo/mongo-food.repository"
import { CreateDietUseCase } from "../usecases/diet/create-diet.usecase"
import { DeleteDietUseCase } from "../usecases/diet/delete-diet.usecase"
import { GetActiveDietUseCase } from "../usecases/diet/get-active-diet.usecase"
import { GetDietByIdUseCase } from "../usecases/diet/get-diet-by-id.usecase"
import { ListDietsUseCase } from "../usecases/diet/list-diets.usecase"
import { SetActiveDietUseCase } from "../usecases/diet/set-active-diet.usecase"
import { UpdateDietUseCase } from "../usecases/diet/update-diet.usecase"
import { CreateCustomFoodUseCase } from "../usecases/food/create-custom-food.usecase"
import { DeleteCustomFoodUseCase } from "../usecases/food/delete-custom-food.usecase"
import { SearchFoodsUseCase } from "../usecases/food/search-foods.usecase"

let dietRepositoryInstance: IDietRepository | null = null
let foodRepositoryInstance: IFoodRepository | null = null
let mongoDatabaseConnector: MongoConnectionManager | null = null

let createCustomFoodUseCaseInstance: CreateCustomFoodUseCase | null = null
let deleteCustomFoodUseCaseInstance: DeleteCustomFoodUseCase | null = null
let searchFoodsUseCaseInstance: SearchFoodsUseCase | null = null

let createDietUseCaseInstance: CreateDietUseCase | null = null
let deleteDietUseCaseInstance: DeleteDietUseCase | null = null
let fetchActiveDietUseCaseInstance: GetActiveDietUseCase | null = null
let fetchDietByIdUseCaseInstance: GetDietByIdUseCase | null = null
let listDietsUseCaseInstance: ListDietsUseCase | null = null
let setActiveDietUseCaseInstance: SetActiveDietUseCase | null = null
let updateDietUseCaseInstance: UpdateDietUseCase | null = null

let dietHttpControllerInstance: DietController | null = null
let foodHttpControllerInstance: FoodController | null = null

export function getMongoDatabaseConnector(): MongoConnectionManager {
    if (!mongoDatabaseConnector) {
        mongoDatabaseConnector = new MongoConnectionManager()
    }

    return mongoDatabaseConnector
}

export function getDietRepositoryInstance(): IDietRepository {
    if (!dietRepositoryInstance) {
        dietRepositoryInstance = new MongoDBDietRepository(getMongoDatabaseConnector())
    }

    return dietRepositoryInstance
}

export function getFoodRepositoryInstance(): IFoodRepository {
    if (!foodRepositoryInstance) {
        foodRepositoryInstance = new MongoDBFoodRepository(getMongoDatabaseConnector())
    }

    return foodRepositoryInstance
}

export function getCreateCustomFoodUseCaseInstance(): CreateCustomFoodUseCase {
    if (!createCustomFoodUseCaseInstance) {
        createCustomFoodUseCaseInstance = new CreateCustomFoodUseCase(getFoodRepositoryInstance())
    }

    return createCustomFoodUseCaseInstance
}

export function getDeleteCustomFoodUseCaseInstance(): DeleteCustomFoodUseCase {
    if (!deleteCustomFoodUseCaseInstance) {
        deleteCustomFoodUseCaseInstance = new DeleteCustomFoodUseCase(getFoodRepositoryInstance())
    }

    return deleteCustomFoodUseCaseInstance
}

export function getSearchFoodUseCaseInstance(): SearchFoodsUseCase {
    if (!searchFoodsUseCaseInstance) {
        searchFoodsUseCaseInstance = new SearchFoodsUseCase(getFoodRepositoryInstance())
    }

    return searchFoodsUseCaseInstance
}

export function getCreateDietUseCaseInstance(): CreateDietUseCase {
    if (!createDietUseCaseInstance) {
        createDietUseCaseInstance = new CreateDietUseCase(getDietRepositoryInstance())
    }

    return createDietUseCaseInstance
}

export function getDeleteDietUseCaseInstance(): DeleteDietUseCase {
    if (!deleteDietUseCaseInstance) {
        deleteDietUseCaseInstance = new DeleteDietUseCase(getDietRepositoryInstance())
    }

    return deleteDietUseCaseInstance
}

export function getActiveDietUseCaseInstance(): GetActiveDietUseCase {
    if (!fetchActiveDietUseCaseInstance) {
        fetchActiveDietUseCaseInstance = new GetActiveDietUseCase(getDietRepositoryInstance())
    }

    return fetchActiveDietUseCaseInstance
}

export function getDietByIdUseCaseInstance(): GetDietByIdUseCase {
    if (!fetchDietByIdUseCaseInstance) {
        fetchDietByIdUseCaseInstance = new GetDietByIdUseCase(getDietRepositoryInstance())
    }

    return fetchDietByIdUseCaseInstance
}

export function getListDietsUseCaseInstance(): ListDietsUseCase {
    if (!listDietsUseCaseInstance)
        listDietsUseCaseInstance = new ListDietsUseCase(getDietRepositoryInstance())

    return listDietsUseCaseInstance
}

export function getSetActiveDietUseCaseInstance(): SetActiveDietUseCase {
    if (!setActiveDietUseCaseInstance)
        setActiveDietUseCaseInstance = new SetActiveDietUseCase(getDietRepositoryInstance())

    return setActiveDietUseCaseInstance
}

export function getUpdateDietUseCase(): UpdateDietUseCase {
    if (!updateDietUseCaseInstance) 
        updateDietUseCaseInstance = new UpdateDietUseCase(getDietRepositoryInstance())

    return updateDietUseCaseInstance
}

export function getDietHttpControllerInstance(): DietController {
    if (!dietHttpControllerInstance)
        dietHttpControllerInstance = new DietController(
            getListDietsUseCaseInstance(),
            getActiveDietUseCaseInstance(),
            getDietByIdUseCaseInstance(),
            getCreateDietUseCaseInstance(),
            getUpdateDietUseCase(),
            getDeleteDietUseCaseInstance(),
            getSetActiveDietUseCaseInstance()
        )

    return dietHttpControllerInstance
}

export function getFoodHttpControllerInstance(): FoodController {
    if (!foodHttpControllerInstance)
        foodHttpControllerInstance = new FoodController(
            getSearchFoodUseCaseInstance(),
            getCreateCustomFoodUseCaseInstance(),
            getDeleteCustomFoodUseCaseInstance()
        )
    
    return foodHttpControllerInstance
}
