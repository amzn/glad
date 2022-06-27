import { Car } from './models/car.js'
import { Truck } from './models/truck.js'
import { render } from './presentation/renderTransportation.js'

const car = new Car()
const truck = new Truck()

render([car, truck])
