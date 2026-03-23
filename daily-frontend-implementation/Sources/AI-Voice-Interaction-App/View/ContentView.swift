import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "mic.fill")
                .imageScale(.large)
                .foregroundColor(.accentColor)
            Text("AI Voice Interaction App")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("Welcome to your AI cognitive assistant")
                .font(.body)
                .foregroundColor(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.white)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
