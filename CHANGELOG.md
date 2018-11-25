## [0.3.6](https://github.com/axetroy/vm.js/compare/v0.3.5...v0.3.6) (2018-11-25)

### Bug Fixes

- close [#22](https://github.com/axetroy/vm.js/issues/22) ([08fea44](https://github.com/axetroy/vm.js/commit/08fea44))

## [0.3.5](https://github.com/axetroy/vm.js/compare/v0.3.4...v0.3.5) (2018-11-25)

### Bug Fixes

- close [#20](https://github.com/axetroy/vm.js/issues/20) ([07fb9fa](https://github.com/axetroy/vm.js/commit/07fb9fa))
- close [#21](https://github.com/axetroy/vm.js/issues/21) ([f36f710](https://github.com/axetroy/vm.js/commit/f36f710))

## [0.3.4](https://github.com/axetroy/vm.js/compare/v0.3.3...v0.3.4) (2018-11-21)

### Bug Fixes

- [#16](https://github.com/axetroy/vm.js/issues/16) ([ab9c702](https://github.com/axetroy/vm.js/commit/ab9c702))
- [#17](https://github.com/axetroy/vm.js/issues/17) ([5a15446](https://github.com/axetroy/vm.js/commit/5a15446))
- fix docs build ([3d848c3](https://github.com/axetroy/vm.js/commit/3d848c3))

## [0.3.3](https://github.com/axetroy/vm.js/compare/v0.3.2...v0.3.3) (2018-06-13)

### Bug Fixes

- assignment should calculate the right side first, close [#12](https://github.com/axetroy/vm.js/issues/12) ([5bdcbdf](https://github.com/axetroy/vm.js/commit/5bdcbdf))
- Can not defined same key in object. close [#14](https://github.com/axetroy/vm.js/issues/14) ([b06da7f](https://github.com/axetroy/vm.js/commit/b06da7f))
- can not overwrite native method like toString, valueOf. close [#13](https://github.com/axetroy/vm.js/issues/13) ([3a0b050](https://github.com/axetroy/vm.js/commit/3a0b050))
- 更换打包方式 ([40b5b48](https://github.com/axetroy/vm.js/commit/40b5b48))

## [0.3.2](https://github.com/axetroy/vm.js/compare/v0.3.1...v0.3.2) (2018-04-30)

## [0.3.1](https://github.com/axetroy/vm.js/compare/v0.3.0...v0.3.1) (2018-04-30)

### Bug Fixes

- stack not pop after leave stack ([7c3c21c](https://github.com/axetroy/vm.js/commit/7c3c21c))

# [0.3.0](https://github.com/axetroy/vm.js/compare/v0.2.2...v0.3.0) (2018-04-30)

### Bug Fixes

- fix stack will not pop if it got fulled ([bde8889](https://github.com/axetroy/vm.js/commit/bde8889))

### Features

- improve error message ([b15694b](https://github.com/axetroy/vm.js/commit/b15694b))
- partial support stack track ([bf159b5](https://github.com/axetroy/vm.js/commit/bf159b5))

## [0.2.2](https://github.com/axetroy/vm.js/compare/v0.2.1...v0.2.2) (2018-04-30)

### Bug Fixes

- continue signal not work in try-catch-block ([3e3a292](https://github.com/axetroy/vm.js/commit/3e3a292))
- continue SwitchStatement can not continue parent loop ([ebd0dec](https://github.com/axetroy/vm.js/commit/ebd0dec))
- fix module of output ([01d4647](https://github.com/axetroy/vm.js/commit/01d4647))
- typo ([db32e49](https://github.com/axetroy/vm.js/commit/db32e49))

### Features

- add constant ([51f1823](https://github.com/axetroy/vm.js/commit/51f1823))
- improve argument defined ([e08cc72](https://github.com/axetroy/vm.js/commit/e08cc72))
- no more provider global object by default ([d781451](https://github.com/axetroy/vm.js/commit/d781451))
- no more provider require function by default. ([3243a17](https://github.com/axetroy/vm.js/commit/3243a17))
- remove visitor check before run ([7bb7127](https://github.com/axetroy/vm.js/commit/7bb7127))
- support decorator for class. not support class property/method in current ([dae053c](https://github.com/axetroy/vm.js/commit/dae053c))

### Performance Improvements

- improve performace of ObjectMethod define ([7db25e0](https://github.com/axetroy/vm.js/commit/7db25e0))

## [0.2.1](https://github.com/axetroy/vm.js/compare/v0.2.0...v0.2.1) (2018-03-29)

### Bug Fixes

- fix function name and length property is not fit with standar ([2303a46](https://github.com/axetroy/vm.js/commit/2303a46))
- update error for undefined ([7e1b39e](https://github.com/axetroy/vm.js/commit/7e1b39e))

### Features

- support more context ([c39900f](https://github.com/axetroy/vm.js/commit/c39900f))
- support new.target for function ([6ab8f3c](https://github.com/axetroy/vm.js/commit/6ab8f3c))
- support new.target in arrow function ([731ddcd](https://github.com/axetroy/vm.js/commit/731ddcd))
- support new.target in class ([dc76edb](https://github.com/axetroy/vm.js/commit/dc76edb))
- support new.target in class method ([691528e](https://github.com/axetroy/vm.js/commit/691528e))
- throw an error if callExpression is not a function ([900849b](https://github.com/axetroy/vm.js/commit/900849b))

# [0.2.0](https://github.com/axetroy/vm.js/compare/v0.1.1...v0.2.0) (2018-03-28)

### Bug Fixes

- fix for loop ([df88403](https://github.com/axetroy/vm.js/commit/df88403))
- fix label for loop ([69fef6b](https://github.com/axetroy/vm.js/commit/69fef6b))

### Features

- Partial support async await ([f6d7838](https://github.com/axetroy/vm.js/commit/f6d7838))
- Partial support label for loop ([4f3010d](https://github.com/axetroy/vm.js/commit/4f3010d))
- support do-while label ([3bbe9e7](https://github.com/axetroy/vm.js/commit/3bbe9e7))
- support for of loop label ([c4229bf](https://github.com/axetroy/vm.js/commit/c4229bf))
- support for-in loop label ([8a6feb9](https://github.com/axetroy/vm.js/commit/8a6feb9))
- support while loop label ([a29ab23](https://github.com/axetroy/vm.js/commit/a29ab23))

## [0.1.1](https://github.com/axetroy/vm.js/compare/v0.1.0...v0.1.1) (2018-03-26)

### Bug Fixes

- fix class super call ([221dd2c](https://github.com/axetroy/vm.js/commit/221dd2c))
- fix for loop scope with fork a new scope to resolve it ([ef201f7](https://github.com/axetroy/vm.js/commit/ef201f7))
- fix let/const do not have block scope ([e174064](https://github.com/axetroy/vm.js/commit/e174064))
- now super() must in class contructor, and can not use this before super() ([d2f76f2](https://github.com/axetroy/vm.js/commit/d2f76f2))
- top level scope do not have this var ([7e7a503](https://github.com/axetroy/vm.js/commit/7e7a503))

# [0.1.0](https://github.com/axetroy/vm.js/compare/af41357...v0.1.0) (2018-03-14)

### Bug Fixes

- bugs ([55aa7d3](https://github.com/axetroy/vm.js/commit/55aa7d3))
- fix block scope in if-else ([e0d4e23](https://github.com/axetroy/vm.js/commit/e0d4e23))
- fix bugs ([b3e4ccd](https://github.com/axetroy/vm.js/commit/b3e4ccd))
- fix bugs ([d30a62f](https://github.com/axetroy/vm.js/commit/d30a62f))
- fix class extends without super ([9a6b3be](https://github.com/axetroy/vm.js/commit/9a6b3be))
- fix class will not auto super from super-class ([bb6decb](https://github.com/axetroy/vm.js/commit/bb6decb))
- fix do-expression block scope ([1b37264](https://github.com/axetroy/vm.js/commit/1b37264))
- fix do-while and for in block scope ([d57c717](https://github.com/axetroy/vm.js/commit/d57c717))
- fix do-while scope ([e9a9542](https://github.com/axetroy/vm.js/commit/e9a9542))
- fix for-of block scope ([0381652](https://github.com/axetroy/vm.js/commit/0381652))
- fix new Function and add test case ([c7cf98e](https://github.com/axetroy/vm.js/commit/c7cf98e))
- fix switch block scope ([6e97fe5](https://github.com/axetroy/vm.js/commit/6e97fe5))
- fix try-catch block scope ([9442114](https://github.com/axetroy/vm.js/commit/9442114))
- fix var can not be recover and redeclarat ([04df8ef](https://github.com/axetroy/vm.js/commit/04df8ef))
- fix VariableDeclaration if the context exist var ([f731bd0](https://github.com/axetroy/vm.js/commit/f731bd0))
- for scope ([cb567a2](https://github.com/axetroy/vm.js/commit/cb567a2))
- refactor how class declaration ([269d97c](https://github.com/axetroy/vm.js/commit/269d97c))
- support arrow function name ([c0d42f7](https://github.com/axetroy/vm.js/commit/c0d42f7))
- support class name and length ([bb4312e](https://github.com/axetroy/vm.js/commit/bb4312e))

### Features

- suppor logicExpression ([36e5b7b](https://github.com/axetroy/vm.js/commit/36e5b7b))
- support array expression ([79a60cd](https://github.com/axetroy/vm.js/commit/79a60cd))
- support ArrowFunctionExpression ([657e794](https://github.com/axetroy/vm.js/commit/657e794))
- support class name ([5ff4aaf](https://github.com/axetroy/vm.js/commit/5ff4aaf))
- support class property ([afbef33](https://github.com/axetroy/vm.js/commit/afbef33))
- support ComputedProperties ([01f4170](https://github.com/axetroy/vm.js/commit/01f4170))
- support ConditionalExpression ([d85afbd](https://github.com/axetroy/vm.js/commit/d85afbd))
- support DefaultParameter ([41250fb](https://github.com/axetroy/vm.js/commit/41250fb))
- support es2015-function-name ([6830ed8](https://github.com/axetroy/vm.js/commit/6830ed8))
- support es6 class ([58866a4](https://github.com/axetroy/vm.js/commit/58866a4))
- support es6 for of ([141ba3a](https://github.com/axetroy/vm.js/commit/141ba3a))
- support es6 module ([955af02](https://github.com/axetroy/vm.js/commit/955af02))
- support es6 template ([b9628e1](https://github.com/axetroy/vm.js/commit/b9628e1))
- support for in ([385ef60](https://github.com/axetroy/vm.js/commit/385ef60))
- support generator function ([4cf7143](https://github.com/axetroy/vm.js/commit/4cf7143))
- support hoisting in block scope ([1073dba](https://github.com/axetroy/vm.js/commit/1073dba))
- support Lifting template and do expression ([18b6d1c](https://github.com/axetroy/vm.js/commit/18b6d1c))
- support more stateMent ([f4d1c30](https://github.com/axetroy/vm.js/commit/f4d1c30))
- support NewExpression ([aafd2b6](https://github.com/axetroy/vm.js/commit/aafd2b6))
- support NullLiteral ([8aa98fb](https://github.com/axetroy/vm.js/commit/8aa98fb))
- support ObjectDestructuringExpression and fix bugs ([f046490](https://github.com/axetroy/vm.js/commit/f046490))
- support reg exp ([a60b6ea](https://github.com/axetroy/vm.js/commit/a60b6ea))
- support RestParameter ([35390fd](https://github.com/axetroy/vm.js/commit/35390fd))
- support SequenceExpression ([6202fef](https://github.com/axetroy/vm.js/commit/6202fef))
- support ShorthandProperties ([8097dad](https://github.com/axetroy/vm.js/commit/8097dad))
- support SpreadElement ([f373172](https://github.com/axetroy/vm.js/commit/f373172))
- support SpreadElement ([444b837](https://github.com/axetroy/vm.js/commit/444b837))
- support super in class ([c87c170](https://github.com/axetroy/vm.js/commit/c87c170))
- support this expression ([398706e](https://github.com/axetroy/vm.js/commit/398706e))
- support Trailing commas in function parameter lists and calls ([8e19de1](https://github.com/axetroy/vm.js/commit/8e19de1))
- support try catch ([af41357](https://github.com/axetroy/vm.js/commit/af41357))
- support UnaryExpression ([26d5e36](https://github.com/axetroy/vm.js/commit/26d5e36))
