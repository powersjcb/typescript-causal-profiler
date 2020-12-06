export const func1 = () => {console.log('original func1')}
export const func2 = () => {func1()}
export const func3 = () => {func2()}

func3();
func1();