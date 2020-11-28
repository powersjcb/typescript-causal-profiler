export const func1 = () => {}
export const func2 = () => {func1()}
export const func3 = () => {func2()}

func3();