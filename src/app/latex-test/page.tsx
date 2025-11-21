import MathExpression from '@/components/MathExpression';

export default function LatexTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">LaTeX Rendering Test</h1>
        
        <div className="space-y-6">
          {/* Current MathMog Examples */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">Current MathMog</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="w-32 text-gray-600">Plain:</span>
                <span className="text-xl">√144 = 12</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-32 text-gray-600">LaTeX:</span>
                <span className="text-xl">
                  <MathExpression>{'$\\sqrt{144} = 12$'}</MathExpression>
                </span>
              </div>
            </div>
          </section>

          {/* More Examples */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-green-800">FactorMog Examples</h2>
            <div className="space-y-2 text-lg">
              <div><MathExpression>{'$x^2 + 5x + 6$'}</MathExpression></div>
              <div><MathExpression>{'$2x^3 - 8x^2 + 6x = 2x(x-1)(x-3)$'}</MathExpression></div>
              <div><MathExpression>{'$x^4 - 16 = (x^2+4)(x+2)(x-2)$'}</MathExpression></div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-800">FormulaMog Examples</h2>
            <div className="space-y-3 text-lg">
              <div>
                <div className="text-sm text-gray-600 mb-1">Quadratic Formula:</div>
                <MathExpression>{'$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$'}</MathExpression>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Distance Formula:</div>
                <MathExpression>{'$d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$'}</MathExpression>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Area of Circle:</div>
                <MathExpression>{'$A = \\pi r^2$'}</MathExpression>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}