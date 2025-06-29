import { Button, Row, Col, Card, Typography, Space, Statistic } from 'antd'
import { 
  ArrowRightOutlined, 
  TeamOutlined,
  FolderOutlined,
  TrophyOutlined,
  GlobalOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const { Title, Paragraph } = Typography

const LandingPage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <FolderOutlined />,
      title: 'Find Internships',
      description: 'Discover micro-internship opportunities across Nepal'
    },
    {
      icon: <TeamOutlined />,
      title: 'Connect with Companies',
      description: 'Build relationships with leading businesses in Nepal'
    },
    {
      icon: <TrophyOutlined />,
      title: 'Earn Certificates',
      description: 'Get recognized for your achievements and skills'
    },
    {
      icon: <GlobalOutlined />,
      title: 'Build Your Future',
      description: 'Start your career journey in the beautiful land of Nepal'
    }
  ]

  const stats = [
    { title: '500+', value: 'Active Internships', suffix: '' },
    { title: '1000+', value: 'Students Placed', suffix: '' },
    { title: '200+', value: 'Partner Companies', suffix: '' },
    { title: '50+', value: 'Cities Covered', suffix: '' }
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
        padding: '12px 24px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #DC143C 0%, #1E3A8A 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              MH
            </div>
            <span style={{ 
              fontSize: '24px', 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #DC143C 0%, #1E3A8A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              MicroHire
            </span>
          </div>
          
          <Space>
            <Button onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button 
              type="primary" 
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
          </Space>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '120px 24px 80px',
        background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Title level={1} style={{ 
              fontSize: '3.5rem', 
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #DC143C 0%, #1E3A8A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2
            }}>
              Connect. Learn. Grow.<br />
              <span style={{ fontSize: '2.5rem' }}>In the Heart of Nepal</span>
            </Title>
            
            <Paragraph style={{ 
              fontSize: '1.25rem', 
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto 40px',
              lineHeight: 1.6
            }}>
              MicroHire bridges the gap between talented students and innovative businesses across Nepal. 
              Start your career journey with meaningful micro-internship opportunities.
            </Paragraph>
            
            <Space size="large">
              <Button 
                type="primary" 
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/register')}
                style={{ 
                  height: '50px',
                  fontSize: '16px',
                  borderRadius: '25px',
                  padding: '0 32px'
                }}
              >
                Start Your Journey
              </Button>
              <Button 
                size="large"
                onClick={() => navigate('/login')}
                style={{ 
                  height: '50px',
                  fontSize: '16px',
                  borderRadius: '25px',
                  padding: '0 32px'
                }}
              >
                I&apos;m a Business
              </Button>
            </Space>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '60px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[32, 32]} justify="center">
            {stats.map((stat, index) => (
              <Col xs={12} sm={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card style={{ textAlign: 'center', border: 'none', boxShadow: 'none' }}>
                    <Statistic
                      title={stat.value}
                      value={stat.title}
                      valueStyle={{ 
                        color: '#DC143C',
                        fontSize: '2.5rem',
                        fontWeight: 700
                      }}
                    />
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ 
        padding: '80px 24px', 
        background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '16px' }}>
            Why Choose MicroHire?
          </Title>
          <Paragraph style={{ 
            fontSize: '1.1rem', 
            color: '#666',
            marginBottom: '60px',
            maxWidth: '600px',
            margin: '0 auto 60px'
          }}>
            We&apos;re committed to connecting Nepal&apos;s brightest minds with opportunities 
            that matter, fostering growth in our beautiful nation.
          </Paragraph>
          
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card 
                    style={{ 
                      height: '100%',
                      textAlign: 'center',
                      borderRadius: '16px',
                      border: '1px solid #e5e7eb'
                    }}
                    hoverable
                  >
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #DC143C 0%, #1E3A8A 100%)',
                      borderRadius: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      fontSize: '24px',
                      color: 'white'
                    }}>
                      {feature.icon}
                    </div>
                    <Title level={4} style={{ marginBottom: '12px' }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{ color: '#666', margin: 0 }}>
                      {feature.description}
                    </Paragraph>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(135deg, #DC143C 0%, #1E3A8A 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={2} style={{ color: 'white', marginBottom: '24px' }}>
            Ready to Shape Nepal&apos;s Future?
          </Title>
          <Paragraph style={{ 
            fontSize: '1.1rem', 
            marginBottom: '40px',
            opacity: 0.9
          }}>
            Join thousands of students and businesses who are already building 
            the future of work in Nepal. Your journey starts here.
          </Paragraph>
          
          <Space size="large">
            <Button 
              size="large"
              onClick={() => navigate('/register')}
              style={{ 
                height: '50px',
                fontSize: '16px',
                borderRadius: '25px',
                padding: '0 32px',
                background: 'white',
                color: '#DC143C',
                border: 'none',
                fontWeight: 600
              }}
            >
              Join as Student
            </Button>
            <Button 
              size="large"
              onClick={() => navigate('/register')}
              style={{ 
                height: '50px',
                fontSize: '16px',
                borderRadius: '25px',
                padding: '0 32px',
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                fontWeight: 600
              }}
            >
              Join as Business
            </Button>
          </Space>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 24px',
        background: '#1f2937',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #DC143C 0%, #1E3A8A 100%)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              MH
            </div>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>
              MicroHire
            </span>
          </div>
          <Paragraph style={{ color: '#9ca3af', margin: 0 }}>
            © 2024 MicroHire. Connecting Nepal&apos;s talent with opportunity.
          </Paragraph>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage