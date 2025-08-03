{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_18
    nodePackages.npm
    nodePackages.yarn
  ];

  shellHook = ''
    echo "🎯 Focus Coach Development Environment"
    echo "Node.js $(node --version)"
    echo "npm $(npm --version)"
    echo ""
    echo "Available commands:"
    echo "  npm run dev     - Start development server"
    echo "  npm run build   - Build for production"
    echo "  npm run preview - Preview production build"
    echo "  npm run lint    - Run linter"
  '';
} 