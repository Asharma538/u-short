import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function BackgroundAnimation() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0f0f23')

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 1)
    pointLight.position.set(10, 10, 10)
    scene.add(pointLight)

    // Animated Particles
    const particlesCount = 2000
    const particlesGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particlesCount * 3)
    const colors = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10

      colors[i * 3] = Math.random()
      colors[i * 3 + 1] = Math.random()
      colors[i * 3 + 2] = Math.random()
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    })

    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    // Animated Sphere
    const sphereGeometry = new THREE.IcosahedronGeometry(1.5, 1)
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: '#6366f1',
      wireframe: true,
      transparent: true,
      opacity: 0.3
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphere)

    // Floating Rings
    const rings = []
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(2 + i * 0.5, 0.02, 16, 100)
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: '#8b5cf6',
        transparent: true,
        opacity: 0.5
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      rings.push(ring)
      scene.add(ring)
    }

    // Stars
    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 5000
    const starsPositions = new Float32Array(starsCount * 3)

    for (let i = 0; i < starsCount; i++) {
      const radius = 50 + Math.random() * 50
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      starsPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      starsPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      starsPositions[i * 3 + 2] = radius * Math.cos(phi)
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3))
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8
    })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    // Animation loop
    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      const time = Date.now() * 0.001

      // Rotate particles
      particles.rotation.y = time * 0.1
      particles.rotation.x = time * 0.05

      // Animate sphere
      sphere.rotation.x = time * 0.2
      sphere.rotation.y = time * 0.3
      const scale = 1 + Math.sin(time) * 0.1
      sphere.scale.set(scale, scale, scale)

      // Animate rings
      rings.forEach((ring, i) => {
        ring.rotation.x = time * (0.1 + i * 0.05)
        ring.rotation.y = time * (0.15 + i * 0.03)
        ring.position.y = Math.sin(time + i) * 0.5
      })

      // Slowly rotate entire scene
      scene.rotation.y += 0.001

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      container.removeChild(renderer.domElement)
      renderer.dispose()
      particlesGeometry.dispose()
      particlesMaterial.dispose()
      sphereGeometry.dispose()
      sphereMaterial.dispose()
      rings.forEach(ring => {
        ring.geometry.dispose()
        ring.material.dispose()
      })
      starsGeometry.dispose()
      starsMaterial.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1
      }}
    />
  )
}
